import { useCallback, useEffect, useMemo, useState } from "react";
import {
  computeDuration,
  computeTotals,
  createId,
  sortEntries,
  type TimeEntry,
} from "@/lib/time";
import { entryStore } from "@/lib/storage";

export type EntryDraft = Omit<TimeEntry, "id" | "durationMinutes" | "createdAt">;

export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(entryStore.load());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: TimeEntry[]) => {
    setEntries(next);
    entryStore.save(next);
  }, []);

  const addEntry = useCallback(
    (draft: EntryDraft) => {
      const duration = computeDuration(draft.start, draft.end, draft.breakMinutes) ?? 0;
      const entry: TimeEntry = {
        ...draft,
        id: createId(),
        durationMinutes: duration,
        createdAt: new Date().toISOString(),
      };
      persist([entry, ...entryStore.load()]);
    },
    [persist],
  );

  const updateEntry = useCallback(
    (id: string, draft: EntryDraft) => {
      const duration = computeDuration(draft.start, draft.end, draft.breakMinutes) ?? 0;
      persist(
        entryStore
          .load()
          .map((e) => (e.id === id ? { ...e, ...draft, durationMinutes: duration } : e)),
      );
    },
    [persist],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(entryStore.load().filter((e) => e.id !== id));
    },
    [persist],
  );

  const sorted = useMemo(() => sortEntries(entries), [entries]);
  const totals = useMemo(() => computeTotals(entries), [entries]);

  return { entries: sorted, totals, hydrated, addEntry, updateEntry, deleteEntry };
}
