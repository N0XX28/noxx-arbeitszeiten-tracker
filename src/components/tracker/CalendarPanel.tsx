import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MONTH_NAMES,
  WEEKDAYS_SHORT,
  formatDuration,
  pad,
  startOfWeek,
  sumMinutes,
  toISODate,
  type TimeEntry,
} from "@/lib/time";

interface CalendarPanelProps {
  entries: TimeEntry[];
  selectedDate: string | null;
  onSelectDate: (iso: string | null) => void;
}

export function CalendarPanel({
  entries,
  selectedDate,
  onSelectDate,
}: CalendarPanelProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const minutesByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.date, (map.get(e.date) ?? 0) + e.durationMinutes);
    }
    return map;
  }, [entries]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = toISODate(d);
      return {
        iso,
        day: d.getDate(),
        inMonth: d.getMonth() === cursor.getMonth(),
        isToday: iso === toISODate(today),
        minutes: minutesByDate.get(iso) ?? 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, minutesByDate]);

  const monthMinutes = useMemo(() => {
    const prefix = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`;
    return sumMinutes(entries.filter((e) => e.date.startsWith(prefix)));
  }, [entries, cursor]);

  const shift = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-[18px]">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-card-foreground">
            {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            {formatDuration(monthMinutes)} erfasst
          </span>
        </div>
        <div className="flex gap-1.5">
          <NavButton label="Vorheriger Monat" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </NavButton>
          <button
            type="button"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-lg border border-border-strong px-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Heute
          </button>
          <NavButton label="Nächster Monat" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </NavButton>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS_SHORT.map((d) => (
          <span
            key={d}
            className="pb-1 text-center text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
          >
            {d}
          </span>
        ))}
        {cells.map((cell) => {
          const selected = cell.iso === selectedDate;
          return (
            <button
              key={cell.iso}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectDate(selected ? null : cell.iso)}
              className={cn(
                "tnum relative flex aspect-square flex-col items-center justify-center rounded-[8px] border text-[13px] transition-colors",
                cell.inMonth ? "text-foreground" : "text-muted-foreground/50",
                selected
                  ? "gradient-brand border-transparent font-semibold text-primary-foreground"
                  : "border-transparent hover:bg-accent",
                cell.isToday && !selected && "border-border-strong",
              )}
            >
              {cell.day}
              {cell.minutes > 0 ? (
                <span
                  className={cn(
                    "absolute bottom-1.5 size-1 rounded-full",
                    selected ? "bg-primary-foreground" : "bg-brand-soft",
                  )}
                />
              ) : null}
            </button>
          );
        })}
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
