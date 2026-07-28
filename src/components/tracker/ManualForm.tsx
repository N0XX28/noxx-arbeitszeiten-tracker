import { useMemo, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { computeDuration, formatDuration, toISODate } from "@/lib/time";
import type { EntryDraft } from "@/hooks/useTimeEntries";

export interface ManualFormValues {
  date: string;
  start: string;
  end: string;
  breakMinutes: string;
  description: string;
}

export const emptyManualValues = (): ManualFormValues => ({
  date: toISODate(new Date()),
  start: "09:00",
  end: "17:00",
  breakMinutes: "30",
  description: "",
});

export function validateManual(values: ManualFormValues): {
  errors: Partial<Record<keyof ManualFormValues, string>>;
  duration: number | null;
} {
  const errors: Partial<Record<keyof ManualFormValues, string>> = {};

  if (!values.date) errors.date = "Bitte ein Datum auswählen.";
  if (!values.start) errors.start = "Bitte eine Startzeit eintragen.";
  if (!values.end) errors.end = "Bitte eine Endzeit eintragen.";

  const breakMinutes = Number(values.breakMinutes === "" ? 0 : values.breakMinutes);
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0) {
    errors.breakMinutes = "Die Pause muss 0 oder größer sein.";
  }

  let duration: number | null = null;
  if (values.start && values.end) {
    duration = computeDuration(values.start, values.end, Math.max(0, breakMinutes || 0));
    if (duration === null) {
      errors.end = "Ungültige Zeitangabe.";
    } else if (values.start === values.end) {
      errors.end = "Start- und Endzeit dürfen nicht identisch sein.";
      duration = null;
    } else if (duration < 0) {
      errors.breakMinutes = "Die Pause ist länger als der erfasste Zeitraum.";
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
    breakMinutes: Math.max(0, Number(values.breakMinutes || 0)),
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
            value={values.breakMinutes}
            onChange={(e) => onChange({ breakMinutes: e.target.value })}
            className={cn(fieldClass, errors.breakMinutes && "border-destructive")}
          />
          {errors.breakMinutes ? <FieldError>{errors.breakMinutes}</FieldError> : null}
        </label>
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
