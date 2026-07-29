import { useMemo, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  breaksMinutes,
  computeDuration,
  formatDuration,
  grossMinutes,
  toISODate,
  type BreakSegment,
} from "@/lib/time";
import type { EntryDraft } from "@/hooks/useTimeEntries";

export interface ManualFormValues {
  date: string;
  start: string;
  end: string;
  breakMinutes: string;
  description: string;
  /** documented breaks; when set they define the total break time */
  breaks: BreakSegment[];
}

export const emptyManualValues = (): ManualFormValues => ({
  date: toISODate(new Date()),
  start: "09:00",
  end: "17:00",
  breakMinutes: "30",
  description: "",
  breaks: [],
});

function effectiveBreakMinutes(values: ManualFormValues): number {
  if (values.breaks.length > 0) return breaksMinutes(values.breaks);
  return Math.max(0, Number(values.breakMinutes === "" ? 0 : values.breakMinutes) || 0);
}

export function validateManual(values: ManualFormValues): {
  errors: Partial<Record<keyof ManualFormValues, string>>;
  duration: number | null;
} {
  const errors: Partial<Record<keyof ManualFormValues, string>> = {};

  if (!values.date) errors.date = "Bitte ein Datum auswählen.";
  if (!values.start) errors.start = "Bitte eine Startzeit eintragen.";
  if (!values.end) errors.end = "Bitte eine Endzeit eintragen.";

  const rawBreak = Number(values.breakMinutes === "" ? 0 : values.breakMinutes);
  if (values.breaks.length === 0 && (!Number.isFinite(rawBreak) || rawBreak < 0)) {
    errors.breakMinutes = "Die Pause muss 0 oder größer sein.";
  }

  if (values.breaks.length > 0) {
    const invalid = values.breaks.some((b) => {
      const len = grossMinutes(b.start, b.end);
      return !b.start || !b.end || len === null || len <= 0;
    });
    if (invalid) errors.breaks = "Jede Pause braucht eine gültige Start- und Endzeit.";
  }

  const breakMinutes = effectiveBreakMinutes(values);

  let duration: number | null = null;
  if (values.start && values.end) {
    duration = computeDuration(values.start, values.end, breakMinutes);
    if (duration === null) {
      errors.end = "Ungültige Zeitangabe.";
    } else if (values.start === values.end) {
      errors.end = "Start- und Endzeit dürfen nicht identisch sein.";
      duration = null;
    } else if (duration < 0) {
      const msg = "Die Pausen sind länger als der erfasste Zeitraum.";
      if (values.breaks.length > 0) errors.breaks = msg;
      else errors.breakMinutes = msg;
      duration = null;
    } else if (duration === 0) {
      errors.breakMinutes = "Die Arbeitszeit beträgt 0 Minuten.";
      duration = null;
    }
  }

  if (values.description.length > 120) {
    errors.description = "Maximal 120 Zeichen.";
  }

  return { errors, duration };
}

export function toDraft(values: ManualFormValues): EntryDraft {
  return {
    date: values.date,
    start: values.start,
    end: values.end,
    breakMinutes: effectiveBreakMinutes(values),
    breaks: values.breaks.length > 0 ? values.breaks : undefined,
    description: values.description.trim(),
  };
}

const fieldClass =
  "rounded-[9px] border border-input bg-field px-3 py-2.5 text-sm text-foreground tnum outline-none placeholder:text-muted-foreground focus:border-brand-soft";

export function ManualEntryFields({
  values,
  errors,
  onChange,
}: {
  values: ManualFormValues;
  errors: Partial<Record<keyof ManualFormValues, string>>;
  onChange: (patch: Partial<ManualFormValues>) => void;
}) {
  const hasSegments = values.breaks.length > 0;

  const addBreak = () => {
    const last = values.breaks[values.breaks.length - 1];
    const suggestion: BreakSegment = last
      ? { start: last.end, end: last.end }
      : { start: "12:00", end: "12:30" };
    onChange({ breaks: [...values.breaks, suggestion] });
  };

  const patchBreak = (index: number, patch: Partial<BreakSegment>) =>
    onChange({
      breaks: values.breaks.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    });

  const removeBreak = (index: number) =>
    onChange({ breaks: values.breaks.filter((_, i) => i !== index) });

  return (
    <div className="flex flex-col gap-[13px]">
      <label className="flex flex-col gap-1.5">
        <span className="label-caps">Beschreibung</span>
        <input
          type="text"
          value={values.description}
          maxLength={120}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="z. B. Projekt Alpha"
          className={fieldClass}
        />
        {errors.description ? <FieldError>{errors.description}</FieldError> : null}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="label-caps">Datum</span>
        <input
          type="date"
          value={values.date}
          onChange={(e) => onChange({ date: e.target.value })}
          className={cn(fieldClass, errors.date && "border-destructive")}
        />
        {errors.date ? <FieldError>{errors.date}</FieldError> : null}
      </label>

      <div className="grid grid-cols-1 gap-[11px] sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="label-caps">Start</span>
          <input
            type="time"
            value={values.start}
            onChange={(e) => onChange({ start: e.target.value })}
            className={cn(fieldClass, errors.start && "border-destructive")}
          />
          {errors.start ? <FieldError>{errors.start}</FieldError> : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label-caps">Ende</span>
          <input
            type="time"
            value={values.end}
            onChange={(e) => onChange({ end: e.target.value })}
            className={cn(fieldClass, errors.end && "border-destructive")}
          />
          {errors.end ? <FieldError>{errors.end}</FieldError> : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label-caps">Pause (Min)</span>
          <input
            type="number"
            min={0}
            step={5}
            disabled={hasSegments}
            value={hasSegments ? String(breaksMinutes(values.breaks)) : values.breakMinutes}
            onChange={(e) => onChange({ breakMinutes: e.target.value })}
            className={cn(
              fieldClass,
              errors.breakMinutes && "border-destructive",
              hasSegments && "opacity-60",
            )}
          />
          {errors.breakMinutes ? <FieldError>{errors.breakMinutes}</FieldError> : null}
        </label>
      </div>

      <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface-raised p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="label-caps">Pausen dokumentieren</span>
          <button
            type="button"
            onClick={addBreak}
            className="inline-flex items-center gap-1 rounded-md border border-border-strong px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Pause
          </button>
        </div>

        {hasSegments ? (
          <ul className="flex list-none flex-col gap-1.5 p-0">
            {values.breaks.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="time"
                  aria-label={`Pause ${i + 1} Start`}
                  value={b.start}
                  onChange={(e) => patchBreak(i, { start: e.target.value })}
                  className={cn(fieldClass, "flex-1 py-2")}
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="time"
                  aria-label={`Pause ${i + 1} Ende`}
                  value={b.end}
                  onChange={(e) => patchBreak(i, { end: e.target.value })}
                  className={cn(fieldClass, "flex-1 py-2")}
                />
                <button
                  type="button"
                  aria-label={`Pause ${i + 1} entfernen`}
                  onClick={() => removeBreak(i)}
                  className="grid size-7 flex-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            Ohne Zeitangabe wird nur die Pausendauer in Minuten gespeichert.
          </p>
        )}
        {errors.breaks ? <FieldError>{errors.breaks}</FieldError> : null}
      </div>
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] text-destructive">{children}</span>;
}

export function ManualForm({ onSubmit }: { onSubmit: (draft: EntryDraft) => void }) {
  const [values, setValues] = useState<ManualFormValues>(emptyManualValues);
  const [touched, setTouched] = useState(false);

  const { errors, duration } = useMemo(() => validateManual(values), [values]);
  const visibleErrors = touched ? errors : {};

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length > 0 || duration === null) return;
    onSubmit(toDraft(values));
    setValues((prev) => ({ ...emptyManualValues(), date: prev.date }));
    setTouched(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-[13px] rounded-xl border border-border bg-surface p-[18px]"
      noValidate
    >
      <ManualEntryFields
        values={values}
        errors={visibleErrors}
        onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
      />

      <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
        <span>Tatsächliche Arbeitszeit</span>
        <span className="tnum font-semibold text-card-foreground">
          {duration === null ? "—" : formatDuration(duration)}
        </span>
      </div>

      <button
        type="submit"
        className="gradient-brand mt-0.5 w-full rounded-[10px] py-[11px] text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[filter] hover:brightness-110 disabled:opacity-50"
      >
        Eintrag speichern
      </button>
    </form>
  );
}
