/** Domain types and pure time helpers for NOXX Time Tracker. */

export interface TimeEntry {
  id: string;
  /** ISO date, yyyy-MM-dd */
  date: string;
  /** HH:mm */
  start: string;
  /** HH:mm */
  end: string;
  /** break in minutes */
  breakMinutes: number;
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
