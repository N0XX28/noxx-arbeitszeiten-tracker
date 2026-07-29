/** Domain types and pure time helpers for NOXX Time Tracker. */

export interface TimeEntry {
  id: string;
  /** ISO date, yyyy-MM-dd */
  date: string;
  /** HH:mm */
  start: string;
  /** HH:mm */
  end: string;
  /** break in minutes (total) */
  breakMinutes: number;
  /** documented break segments, ordered by clock time */
  breaks?: BreakSegment[];
  description: string;
  /** net worked minutes (end - start - break), may span midnight */
  durationMinutes: number;
  createdAt: string;
}

export const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeInput(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Minutes since midnight from "HH:mm". Returns null when invalid. */
export function parseTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Gross span in minutes; end before start is treated as crossing midnight. */
export function grossMinutes(start: string, end: string): number | null {
  const s = parseTime(start);
  const e = parseTime(end);
  if (s === null || e === null) return null;
  return e >= s ? e - s : 24 * 60 - s + e;
}

export function computeDuration(
  start: string,
  end: string,
  breakMinutes: number,
): number | null {
  const gross = grossMinutes(start, end);
  if (gross === null) return null;
  return gross - breakMinutes;
}

/** Human duration, e.g. "2 Std 15 Min" / "45 Min". */
export function formatDuration(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m} Min`;
  if (m === 0) return `${sign}${h} Std`;
  return `${sign}${h} Std ${m} Min`;
}

/** Compact duration "H:MM". */
export function formatCompact(totalMinutes: number): string {
  const abs = Math.abs(Math.round(totalMinutes));
  return `${Math.floor(abs / 60)}:${pad(abs % 60)}`;
}

export function formatStopwatch(elapsedMs: number): {
  hh: string;
  mm: string;
  ss: string;
} {
  const total = Math.max(0, Math.floor(elapsedMs / 1000));
  return {
    hh: pad(Math.floor(total / 3600)),
    mm: pad(Math.floor((total % 3600) / 60)),
    ss: pad(total % 60),
  };
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS_SHORT[(date.getDay() + 6) % 7]}, ${pad(d)}.${pad(m)}.${y}`;
}

/** Monday-based start of week. */
export function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

export function sumMinutes(entries: TimeEntry[]): number {
  return entries.reduce((acc, e) => acc + e.durationMinutes, 0);
}

export interface Totals {
  today: number;
  week: number;
  month: number;
  monthLabel: string;
  weekBars: { key: string; minutes: number; isToday: boolean }[];
}

export function computeTotals(entries: TimeEntry[], now = new Date()): Totals {
  const todayIso = toISODate(now);
  const weekStart = startOfWeek(now);
  const weekDays = Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i)));
  const monthPrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const today = sumMinutes(entries.filter((e) => e.date === todayIso));
  const week = sumMinutes(entries.filter((e) => weekDays.includes(e.date)));
  const month = sumMinutes(entries.filter((e) => e.date.startsWith(monthPrefix)));

  const weekBars = weekDays.map((day) => ({
    key: day,
    minutes: sumMinutes(entries.filter((e) => e.date === day)),
    isToday: day === todayIso,
  }));

  return {
    today,
    week,
    month,
    monthLabel: MONTH_NAMES[now.getMonth()],
    weekBars,
  };
}

export function sortEntries(entries: TimeEntry[]): TimeEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.start < b.start ? 1 : -1;
  });
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* ---------------------------------------------------------------------------
 * Pausen-Segmente
 * ------------------------------------------------------------------------- */

/** A documented break inside a time entry ("HH:mm" clock times). */
export interface BreakSegment {
  start: string;
  end: string;
}

export type DaySegmentType = "work" | "break";

export interface DaySegment {
  type: DaySegmentType;
  start: string;
  end: string;
  minutes: number;
  entryId: string;
  description: string;
}

export function addMinutesToTime(time: string, delta: number): string {
  const base = parseTime(time) ?? 0;
  const total = ((base + delta) % 1440 + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function breaksMinutes(breaks: BreakSegment[] | undefined): number {
  if (!breaks?.length) return 0;
  return breaks.reduce((acc, b) => acc + (grossMinutes(b.start, b.end) ?? 0), 0);
}

/**
 * Ordered work/break segments of one entry, based on the documented breaks.
 * Falls back to a single work block when no breaks were recorded.
 */
export function entrySegments(entry: TimeEntry): DaySegment[] {
  const total = grossMinutes(entry.start, entry.end);
  if (total === null) return [];
  const startMin = parseTime(entry.start) ?? 0;

  const rel = (time: string) => {
    const p = parseTime(time);
    return p === null ? null : (p - startMin + 1440) % 1440;
  };

  const raw = (entry.breaks ?? [])
    .map((b) => {
      const s = rel(b.start);
      const len = grossMinutes(b.start, b.end);
      if (s === null || len === null) return null;
      return { s: Math.min(s, total), e: Math.min(s + len, total) };
    })
    .filter((b): b is { s: number; e: number } => Boolean(b) && b!.e > b!.s)
    .sort((a, b) => a.s - b.s);

  // merge overlapping breaks
  const merged: { s: number; e: number }[] = [];
  for (const b of raw) {
    const last = merged[merged.length - 1];
    if (last && b.s <= last.e) last.e = Math.max(last.e, b.e);
    else merged.push({ ...b });
  }

  const segments: DaySegment[] = [];
  const push = (type: DaySegmentType, from: number, to: number) => {
    if (to <= from) return;
    segments.push({
      type,
      start: addMinutesToTime(entry.start, from),
      end: addMinutesToTime(entry.start, to),
      minutes: to - from,
      entryId: entry.id,
      description: entry.description,
    });
  };

  let cursor = 0;
  for (const b of merged) {
    push("work", cursor, b.s);
    push("break", b.s, b.e);
    cursor = b.e;
  }
  push("work", cursor, total);
  return segments;
}

/** All segments of a day, ordered by clock time. */
export function daySegments(entries: TimeEntry[], iso: string): DaySegment[] {
  return entries
    .filter((e) => e.date === iso)
    .flatMap(entrySegments)
    .sort((a, b) => (parseTime(a.start) ?? 0) - (parseTime(b.start) ?? 0));
}

export function sumBreakMinutes(entries: TimeEntry[]): number {
  return entries.reduce((acc, e) => acc + (e.breakMinutes || 0), 0);
}
