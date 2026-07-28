import { cn } from "@/lib/utils";
import { formatDuration, type Totals } from "@/lib/time";

interface StatCardsProps {
  totals: Totals;
  entryCount: number;
  /** daily target in minutes, used for the progress bar */
  dailyTargetMinutes?: number;
}

export function StatCards({
  totals,
  entryCount,
  dailyTargetMinutes = 480,
}: StatCardsProps) {
  const targetPct = Math.min(100, Math.round((totals.today / dailyTargetMinutes) * 100));
  const maxBar = Math.max(60, ...totals.weekBars.map((b) => b.minutes));

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      <article className="flex flex-col gap-[7px] rounded-[10px] border border-border bg-surface px-[13px] pt-3 pb-[13px]">
        <span className="label-caps">Heute</span>
        <span className="tnum text-[23px] leading-none font-semibold tracking-[-0.02em] text-card-foreground">
          {formatDuration(totals.today)}
        </span>
        <div className="h-[3px] overflow-hidden rounded-[2px] bg-border">
          <div
            className="h-full rounded-[2px] bg-brand-soft transition-[width] duration-500"
            style={{ width: `${targetPct}%` }}
          />
        </div>
        <span className="text-[10.5px] text-muted-foreground">
          {targetPct}% von {formatDuration(dailyTargetMinutes)}
        </span>
      </article>

      <article className="flex flex-col gap-[7px] rounded-[10px] border border-border bg-surface px-[13px] pt-3 pb-[13px]">
        <span className="label-caps">Woche</span>
        <span className="tnum text-[23px] leading-none font-semibold tracking-[-0.02em] text-card-foreground">
          {formatDuration(totals.week)}
        </span>
        <div className="flex h-[18px] items-end gap-[3px]">
          {totals.weekBars.map((bar) => (
            <div
              key={bar.key}
              className={cn(
                "min-h-[2px] flex-1 rounded-[1.5px]",
                bar.isToday ? "bg-brand-soft" : "bg-border-strong",
              )}
              style={{ height: `${Math.round((bar.minutes / maxBar) * 100)}%` }}
            />
          ))}
        </div>
      </article>

      <article className="flex flex-col gap-[7px] rounded-[10px] border border-border bg-surface px-[13px] pt-3 pb-[13px]">
        <span className="label-caps">{totals.monthLabel}</span>
        <span className="tnum text-[23px] leading-none font-semibold tracking-[-0.02em] text-card-foreground">
          {formatDuration(totals.month)}
        </span>
        <span className="mt-auto text-[10.5px] text-muted-foreground">
          {entryCount === 1 ? "1 Eintrag" : `${entryCount} Einträge`}
        </span>
      </article>
    </div>
  );
}
