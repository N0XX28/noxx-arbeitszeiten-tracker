import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WEEKDAYS_SHORT,
  addDays,
  daySegments,
  formatDuration,
  pad,
  startOfWeek,
  sumBreakMinutes,
  sumMinutes,
  toISODate,
  type TimeEntry,
} from "@/lib/time";

interface WeekViewProps {
  entries: TimeEntry[];
  selectedDate: string | null;
  onSelectDate: (iso: string | null) => void;
}

export function WeekView({ entries, selectedDate, onSelectDate }: WeekViewProps) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const iso = toISODate(date);
      const dayEntries = entries.filter((e) => e.date === iso);
      return {
        iso,
        label: WEEKDAYS_SHORT[i],
        dayNumber: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`,
        isToday: iso === toISODate(today),
        segments: daySegments(entries, iso),
        workMinutes: sumMinutes(dayEntries),
        breakMinutes: sumBreakMinutes(dayEntries),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, weekStart]);

  const weekWork = days.reduce((a, d) => a + d.workMinutes, 0);
  const weekBreak = days.reduce((a, d) => a + d.breakMinutes, 0);
  const rangeLabel = `${days[0].dayNumber} – ${days[6].dayNumber}`;

  const shift = (delta: number) => setWeekStart((c) => addDays(c, delta * 7));

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-[18px]">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-card-foreground">
            Woche {rangeLabel}
          </span>
          <span className="tnum text-[11.5px] text-muted-foreground">
            {formatDuration(weekWork)} Arbeit · {formatDuration(weekBreak)} Pause
          </span>
        </div>
        <div className="flex flex-none gap-1.5">
          <NavButton label="Vorherige Woche" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </NavButton>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="rounded-lg border border-border-strong px-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Heute
          </button>
          <NavButton label="Nächste Woche" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </NavButton>
        </div>
      </header>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="grid min-w-[640px] grid-cols-7 gap-1.5">
          {days.map((day) => {
            const selected = day.iso === selectedDate;
            return (
              <div key={day.iso} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectDate(selected ? null : day.iso)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-[8px] border px-1 py-1.5 transition-colors",
                    selected
                      ? "gradient-brand border-transparent text-primary-foreground"
                      : "border-border hover:bg-accent",
                    day.isToday && !selected && "border-border-strong",
                  )}
                >
                  <span className="text-[10px] font-medium tracking-[0.12em] uppercase">
                    {day.label}
                  </span>
                  <span className="tnum text-[12px] font-semibold">{day.dayNumber}</span>
                </button>

                <div className="flex min-h-[112px] flex-col gap-1 rounded-[8px] border border-border bg-surface-raised p-1">
                  {day.segments.length === 0 ? (
                    <span className="m-auto text-[11px] text-muted-foreground/60">—</span>
                  ) : (
                    day.segments.map((seg, i) => (
                      <div
                        key={`${seg.entryId}-${i}`}
                        title={
                          seg.type === "work"
                            ? `${seg.description || "Arbeitszeit"} ${seg.start}–${seg.end}`
                            : `Pause ${seg.start}–${seg.end}`
                        }
                        className={cn(
                          "tnum rounded-[6px] border px-1.5 py-1 text-[10.5px] leading-tight",
                          seg.type === "work"
                            ? "border-brand/40 bg-brand/15 text-card-foreground"
                            : "border-dashed border-border-strong bg-transparent text-muted-foreground",
                        )}
                      >
                        <span className="block">
                          {seg.start}–{seg.end}
                        </span>
                        <span className="block truncate">
                          {seg.type === "work"
                            ? seg.description || "Arbeit"
                            : "Pause"}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="tnum text-center text-[10.5px] text-muted-foreground">
                  <span className="block text-card-foreground">
                    {day.workMinutes > 0 ? formatDuration(day.workMinutes) : "0 Min"}
                  </span>
                  {day.breakMinutes > 0 ? (
                    <span className="block">+{day.breakMinutes} Min Pause</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
