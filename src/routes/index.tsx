import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { StatCards } from "@/components/tracker/StatCards";
import { TabSwitch, type TrackerTab } from "@/components/tracker/TabSwitch";
import { StopwatchPanel } from "@/components/tracker/StopwatchPanel";
import { ManualForm } from "@/components/tracker/ManualForm";
import { CalendarPanel } from "@/components/tracker/CalendarPanel";
import { EntryList } from "@/components/tracker/EntryList";
import { EntryEditDialog } from "@/components/tracker/EntryEditDialog";
import { DeleteEntryDialog } from "@/components/tracker/DeleteEntryDialog";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useStopwatch } from "@/hooks/useStopwatch";
import { downloadCsv } from "@/lib/csv";
import {
  formatDateLong,
  formatDuration,
  sumMinutes,
  toISODate,
  toTimeInput,
  type TimeEntry,
} from "@/lib/time";

const TITLE = "NOXX Time Tracker – Arbeitszeit erfassen";
const DESCRIPTION =
  "Arbeitszeit per Stoppuhr oder manuell erfassen, Tages-, Wochen- und Monatssummen im Blick behalten und als CSV exportieren.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  const { entries, totals, addEntry, updateEntry, deleteEntry } = useTimeEntries();
  const stopwatch = useStopwatch();

  const [tab, setTab] = useState<TrackerTab>("stopwatch");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [deleting, setDeleting] = useState<TimeEntry | null>(null);

  const listEntries = useMemo(
    () =>
      tab === "calendar" && selectedDate
        ? entries.filter((e) => e.date === selectedDate)
        : entries,
    [entries, tab, selectedDate],
  );

  const handleStop = () => {
    const session = stopwatch.finish();
    const minutes = Math.round(session.totalMs / 60000);
    if (minutes < 1) {
      toast.error("Zu kurz zum Speichern", {
        description: "Erfasste Zeiten müssen mindestens eine Minute betragen.",
      });
      return;
    }
    addEntry({
      date: toISODate(session.start),
      start: toTimeInput(session.start),
      end: toTimeInput(session.end),
      breakMinutes: 0,
      description: session.description.trim(),
    });
    toast.success("Zeit gespeichert", { description: formatDuration(minutes) });
  };

  const handleExport = () => {
    if (entries.length === 0) {
      toast.error("Keine Einträge vorhanden", {
        description: "Erfasse zuerst eine Arbeitszeit.",
      });
      return;
    }
    downloadCsv(entries);
    toast.success("CSV exportiert");
  };

  return (
    <main className="min-h-screen bg-background px-5 pt-11 pb-18 sm:px-6">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-[22px]">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow">Zeiterfassung</span>
            <h1 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-card-foreground sm:text-[31px]">
              NOXX Time Tracker
            </h1>
            <p className="text-[13.5px] text-muted-foreground">
              Stoppuhr starten oder Zeiten manuell nachtragen.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex flex-none items-center gap-[7px] rounded-lg border border-input bg-surface px-[13px] py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-brand/55 hover:text-foreground"
          >
            <Download className="size-3.5" />
            CSV
          </button>
        </header>

        <StatCards totals={totals} entryCount={entries.length} />

        <TabSwitch value={tab} onChange={setTab} />

        {tab === "stopwatch" ? (
          <StopwatchPanel
            status={stopwatch.status}
            elapsedMs={stopwatch.elapsedMs}
            description={stopwatch.description}
            onDescriptionChange={stopwatch.setDescription}
            onStart={() => stopwatch.start(stopwatch.description)}
            onPause={stopwatch.pause}
            onResume={stopwatch.resume}
            onStop={handleStop}
            onDiscard={stopwatch.reset}
          />
        ) : null}

        {tab === "manual" ? <ManualForm onSubmit={addEntry} /> : null}

        {tab === "calendar" ? (
          <CalendarPanel
            entries={entries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        ) : null}

        <section className="mt-1.5 flex flex-col gap-[9px]">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-card-foreground">
              {tab === "calendar" && selectedDate
                ? formatDateLong(selectedDate)
                : "Einträge"}
            </h2>
            <span className="tnum flex-none text-[11.5px] whitespace-nowrap text-muted-foreground">
              {listEntries.length} · {formatDuration(sumMinutes(listEntries))}
            </span>
          </div>
          <EntryList
            entries={listEntries}
            onEdit={setEditing}
            onDelete={setDeleting}
            emptyHint={
              tab === "calendar" && selectedDate
                ? "Für diesen Tag sind keine Zeiten erfasst."
                : undefined
            }
          />
        </section>
      </div>

      <EntryEditDialog
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(id, draft) => {
          updateEntry(id, draft);
          toast.success("Eintrag aktualisiert");
        }}
      />
      <DeleteEntryDialog
        entry={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={(id) => {
          deleteEntry(id);
          toast.success("Eintrag gelöscht");
        }}
      />
      <Toaster position="bottom-center" />
    </main>
  );
}
