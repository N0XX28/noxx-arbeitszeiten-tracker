import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ManualEntryFields,
  toDraft,
  validateManual,
  type ManualFormValues,
} from "@/components/tracker/ManualForm";
import { formatDuration, type TimeEntry } from "@/lib/time";
import type { EntryDraft } from "@/hooks/useTimeEntries";

export function EntryEditDialog({
  entry,
  onClose,
  onSave,
}: {
  entry: TimeEntry | null;
  onClose: () => void;
  onSave: (id: string, draft: EntryDraft) => void;
}) {
  const [values, setValues] = useState<ManualFormValues | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!entry) {
      setValues(null);
      return;
    }
    setValues({
      date: entry.date,
      start: entry.start,
      end: entry.end,
      breakMinutes: String(entry.breakMinutes),
      description: entry.description,
      breaks: entry.breaks ?? [],
    });
    setTouched(false);
  }, [entry]);

  const result = useMemo(
    () => (values ? validateManual(values) : null),
    [values],
  );

  const handleSave = () => {
    if (!entry || !values || !result) return;
    setTouched(true);
    if (Object.keys(result.errors).length > 0 || result.duration === null) return;
    onSave(entry.id, toDraft(values));
    onClose();
  };

  return (
    <Dialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border bg-surface sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Eintrag bearbeiten</DialogTitle>
          <DialogDescription>
            Passe Datum, Zeiten, Pause oder Beschreibung an.
          </DialogDescription>
        </DialogHeader>

        {values && result ? (
          <>
            <ManualEntryFields
              values={values}
              errors={touched ? result.errors : {}}
              onChange={(patch) => setValues({ ...values, ...patch })}
            />
            <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
              <span>Tatsächliche Arbeitszeit</span>
              <span className="tnum font-semibold text-card-foreground">
                {result.duration === null ? "—" : formatDuration(result.duration)}
              </span>
            </div>
          </>
        ) : null}

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-border-strong px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="gradient-brand rounded-[10px] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[filter] hover:brightness-110"
          >
            Änderungen speichern
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
