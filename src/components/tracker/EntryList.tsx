import { Pencil, Trash2 } from "lucide-react";
import { entrySegments, formatDateLong, formatDuration, type TimeEntry } from "@/lib/time";
import { cn } from "@/lib/utils";

interface EntryListProps {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
  emptyHint?: string;
}

export function EntryList({ entries, onEdit, onDelete, emptyHint }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-border-strong bg-surface/40 px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {emptyHint ?? "Noch keine Zeiten erfasst."}
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground/70">
          Starte die Stoppuhr oder trage eine Zeit manuell nach.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex list-none flex-col gap-[5px] p-0">
      {entries.map((entry) => {
        const segments = entry.breaks?.length ? entrySegments(entry) : [];
        return (
        <li
          key={entry.id}
          className="flex flex-wrap items-center gap-3 rounded-[9px] border border-border bg-surface-raised px-[13px] py-[11px] transition-colors hover:border-border-strong hover:bg-surface"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[13.5px] font-medium text-card-foreground">
              {entry.description || "Ohne Beschreibung"}
            </span>
            <span className="tnum truncate text-[11.5px] text-muted-foreground">
              {formatDateLong(entry.date)} · {entry.start}–{entry.end}
              {entry.breakMinutes > 0 ? ` · ${entry.breakMinutes} Min Pause` : ""}
            </span>
          </div>
          <span className="tnum flex-none text-[13.5px] font-semibold whitespace-nowrap text-brand-soft">
            {formatDuration(entry.durationMinutes)}
          </span>
          <div className="flex flex-none gap-1">
            <IconButton label="Eintrag bearbeiten" onClick={() => onEdit(entry)}>
              <Pencil className="size-[15px]" />
            </IconButton>
            <IconButton label="Eintrag löschen" onClick={() => onDelete(entry)}>
              <Trash2 className="size-[15px]" />
            </IconButton>
          </div>
          {segments.length > 0 ? (
            <ul className="flex w-full list-none flex-wrap gap-1 p-0">
              {segments.map((seg, i) => (
                <li
                  key={`${seg.entryId}-${i}`}
                  className={cn(
                    "tnum rounded-full border px-2 py-0.5 text-[11px]",
                    seg.type === "work"
                      ? "border-brand/40 bg-brand/15 text-card-foreground"
                      : "border-dashed border-border-strong text-muted-foreground",
                  )}
                >
                  {seg.type === "work" ? "Arbeit" : "Pause"} {seg.start}–{seg.end}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        );
      })}
    </ul>
  );
}

function IconButton({
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
      className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
