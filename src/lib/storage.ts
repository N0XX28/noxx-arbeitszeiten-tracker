/**
 * Persistence layer. Currently backed by localStorage.
 * The repository interface is intentionally async so it can later be swapped
 * for a database / account-backed implementation without touching the UI.
 */
import type { TimeEntry } from "./time";

const ENTRIES_KEY = "noxx.entries.v1";
const STOPWATCH_KEY = "noxx.stopwatch.v1";

export interface StopwatchState {
  /** epoch ms of the last resume, null when paused/idle */
  startedAt: number | null;
  /** accumulated ms from previous runs */
  accumulatedMs: number;
  description: string;
  active: boolean;
  /** documented breaks; the last one may still be open (endedAt === null) */
  breaks: StopwatchBreak[];
}

export interface StopwatchBreak {
  startedAt: number;
  endedAt: number | null;
}

export const emptyStopwatch: StopwatchState = {
  startedAt: null,
  accumulatedMs: 0,
  description: "",
  active: false,
  breaks: [],
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const entryStore = {
  load(): TimeEntry[] {
    if (!isBrowser()) return [];
    const parsed = safeParse<TimeEntry[]>(localStorage.getItem(ENTRIES_KEY), []);
    return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e.id === "string") : [];
  },
  save(entries: TimeEntry[]): void {
    if (!isBrowser()) return;
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  },
};

export const stopwatchStore = {
  load(): StopwatchState {
    if (!isBrowser()) return emptyStopwatch;
    const parsed = safeParse<StopwatchState>(
      localStorage.getItem(STOPWATCH_KEY),
      emptyStopwatch,
    );
    if (typeof parsed?.accumulatedMs !== "number") return emptyStopwatch;
    return {
      ...emptyStopwatch,
      ...parsed,
      breaks: Array.isArray(parsed.breaks) ? parsed.breaks : [],
    };
  },
  save(state: StopwatchState): void {
    if (!isBrowser()) return;
    localStorage.setItem(STOPWATCH_KEY, JSON.stringify(state));
  },
  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(STOPWATCH_KEY);
  },
};
