import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatStopwatch, type TimeEntry } from "@/lib/time";
import type { StopwatchStatus } from "@/hooks/useStopwatch";

interface StopwatchPanelProps {
  status: StopwatchStatus;
  elapsedMs: number;
  description: string;
  onDescriptionChange: (value: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDiscard: () => void;
  lastSaved?: TimeEntry | null;
}

const STATUS_META: Record<StopwatchStatus, { label: string; dot: string }> = {
  idle: { label: "Bereit", dot: "bg-muted-foreground" },
  running: { label: "Läuft", dot: "bg-brand-cyan animate-status-pulse" },
  paused: { label: "Pausiert", dot: "bg-destructive" },
};

export function StopwatchPanel({
  status,
  elapsedMs,
  description,
  onDescriptionChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
}: StopwatchPanelProps) {
  const { hh, mm, ss } = formatStopwatch(elapsedMs);
  const meta = STATUS_META[status];
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  return (
    <section className="panel-glow relative overflow-hidden rounded-[14px] border border-brand/25 bg-surface-raised px-5 pt-[30px] pb-[26px] shadow-[var(--shadow-panel)] sm:px-[26px]">
      <div className="relative flex flex-col items-center gap-[18px]">
        <div className="flex items-center gap-2">
          <span className={cn("size-[7px] rounded-full", meta.dot)} />
          <span className="eyebrow">{meta.label}</span>
        </div>

        <div
          className="tnum flex items-baseline text-[clamp(52px,13vw,104px)] leading-[0.9] font-semibold tracking-[-0.045em] text-card-foreground"
          role="timer"
          aria-label={`Erfasste Zeit ${hh} Stunden ${mm} Minuten ${ss} Sekunden`}
        >
          <span>{hh}</span>
          <span className="px-[0.04em] text-border-strong">:</span>
          <span>{mm}</span>
          <span className="px-[0.04em] text-border-strong">:</span>
          <span>{ss}</span>
        </div>

        {status === "idle" ? (
          <div className="flex w-full flex-col items-center gap-3">
            <input
              type="text"
              value={description}
              maxLength={120}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Woran arbeitest du?"
              aria-label="Tätigkeit"
              className="w-full max-w-[340px] rounded-[9px] border border-input bg-field px-3.5 py-2.5 text-center text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-soft"
            />
            <button
              type="button"
              onClick={onStart}
              className="gradient-brand inline-flex items-center gap-2.5 rounded-[10px] px-[30px] py-3 text-[14.5px] font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[filter] hover:brightness-110 active:brightness-95"
            >
              <span className="size-2 rounded-full bg-primary-foreground" />
              Zeit starten
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-[13px]">
            <span className="max-w-full truncate text-[13.5px] text-muted-foreground">
              {description.trim() || "Ohne Beschreibung"}
            </span>
            <div className="flex flex-wrap justify-center gap-[9px]">
              {status === "running" ? (
                <button
                  type="button"
                  onClick={onPause}
                  className="rounded-[10px] border border-border-strong px-5 py-[11px] text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onResume}
                  className="rounded-[10px] border border-border-strong px-5 py-[11px] text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Fortsetzen
                </button>
              )}
              <button
                type="button"
                onClick={onStop}
                className="gradient-brand rounded-[10px] px-[22px] py-[11px] text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[filter] hover:brightness-110"
              >
                Stoppen &amp; speichern
              </button>
              <button
                type="button"
                onClick={() => (confirmDiscard ? onDiscard() : setConfirmDiscard(true))}
                onBlur={() => setConfirmDiscard(false)}
                className="rounded-[10px] border border-border-strong px-5 py-[11px] text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {confirmDiscard ? "Wirklich verwerfen?" : "Verwerfen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
