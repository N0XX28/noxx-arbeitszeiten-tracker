import { cn } from "@/lib/utils";

export type TrackerTab = "stopwatch" | "manual" | "week" | "calendar";

const TABS: { id: TrackerTab; label: string }[] = [
  { id: "stopwatch", label: "Stoppuhr" },
  { id: "manual", label: "Manuell" },
  { id: "week", label: "Woche" },
  { id: "calendar", label: "Kalender" },
];

export function TabSwitch({
  value,
  onChange,
}: {
  value: TrackerTab;
  onChange: (tab: TrackerTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Erfassungsart"
      className="flex flex-wrap gap-1.5 self-start rounded-[10px] border border-border bg-surface-raised p-1"
    >
      {TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-[7px] px-[15px] py-[7px] text-[13px] transition-colors",
              active
                ? "gradient-brand font-semibold text-primary-foreground"
                : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
