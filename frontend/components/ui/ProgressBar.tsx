import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** "accent" is blue; "warning" is amber, used for flagged model scores. */
  tone?: "accent" | "warning";
  /** Bar thickness in px. */
  height?: number;
  /** Read out by screen readers, e.g. "CT progress". */
  label: string;
}

/** A thin horizontal bar for progress and model scores. */
export function ProgressBar({ value, tone = "accent", height = 6, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="w-full overflow-hidden rounded-full bg-card-border"
      style={{ height }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      {/* Width is data-driven, so it stays an inline style. */}
      <div
        className={cn("h-full rounded-full transition-[width] duration-400", tone === "warning" ? "bg-warning" : "bg-accent")}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
