import { formatCompact, type TimeEntry } from "@/lib/time";

const HEADERS = [
  "Datum",
  "Startzeit",
  "Endzeit",
  "Pause (Min)",
  "Tätigkeit",
  "Dauer (Std:Min)",
  "Dauer (Min)",
];

function escapeCell(value: string | number): string {
  const str = String(value);
  return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function buildCsv(entries: TimeEntry[]): string {
  const rows = entries.map((e) =>
    [
      e.date,
      e.start,
      e.end,
      e.breakMinutes,
      e.description || "Ohne Beschreibung",
      formatCompact(e.durationMinutes),
      e.durationMinutes,
    ]
      .map(escapeCell)
      .join(";"),
  );
  return ["\uFEFF" + HEADERS.join(";"), ...rows].join("\r\n");
}

export function downloadCsv(entries: TimeEntry[]): void {
  const blob = new Blob([buildCsv(entries)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `noxx-arbeitszeiten-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
