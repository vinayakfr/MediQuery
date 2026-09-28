import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FILE_KIND_META } from "@/lib/file-kinds";
import type { AgentStatus, FileKind } from "@/lib/types";

type Tone = "success" | "info" | "neutral" | "muted" | "warning" | "danger" | FileKind;
type Size = "sm" | "md";

/*
 * Full class names are written out (never built with template strings)
 * so Tailwind can find them when it scans the source.
 */
const TONES: Record<Tone, string> = {
  success: "bg-success-soft text-success-text",
  info: "bg-accent-soft text-accent-text",
  neutral: "bg-[#1f2226] text-muted",
  muted: "bg-[#1a1c1f] text-subtle",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger",
  xray: "bg-xray-bg text-xray",
  mri: "bg-mri-bg text-mri",
  ct: "bg-ct-bg text-ct",
  prescription: "bg-prescription-bg text-prescription",
};

const SIZES: Record<Size, string> = {
  sm: "px-[9px] py-0.5 text-[11px]",
  md: "px-3 py-1 text-[13px]",
};

interface PillProps {
  tone: Tone;
  size?: Size;
  /** Adds a small dot (in the text colour) before the label. */
  dot?: boolean;
  /** Adds a soft glow to the dot, used for "live" states. */
  glow?: boolean;
  className?: string;
  children: ReactNode;
}

/** A small rounded label. The building block for every badge in the app. */
export function Pill({ tone, size = "md", dot, glow, className, children }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-[7px] whitespace-nowrap rounded-full font-semibold",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {dot && <span className={cn("size-[7px] rounded-full bg-current", glow && "shadow-[0_0_8px_currentColor]")} />}
      {children}
    </span>
  );
}

/** Words and colours for each agent status. */
const STATUS_PRESENTATION: Record<AgentStatus, { label: string; tone: Tone }> = {
  done: { label: "Done", tone: "success" },
  active: { label: "Working…", tone: "info" },
  pending: { label: "Waiting", tone: "neutral" },
  skipped: { label: "Skipped", tone: "muted" },
  failed: { label: "Failed", tone: "danger" },
};

/** "Done", "Working…", "Waiting" or "Skipped", coloured to match. */
export function StatusPill({ status, size = "sm" }: { status: AgentStatus; size?: Size }) {
  const { label, tone } = STATUS_PRESENTATION[status];
  return (
    <Pill tone={tone} size={size}>
      {label}
    </Pill>
  );
}

/** "X-ray", "MRI", "CT" or "Prescription" in that kind's colour. */
/** "X-ray", "MRI", "CT" or "Prescription" in that kind's colour. Unknown kinds show as a plain grey pill. */
export function KindBadge({ kind, size = "sm", className }: { kind: FileKind; size?: Size; className?: string }) {
  const meta = FILE_KIND_META[kind];

  // Guard against the backend sending a kind we don't know (e.g. "X-ray" instead of "xray").
  if (!meta) {
    return (
      <Pill tone="neutral" size={size} className={className}>
        {String(kind ?? "Other")}
      </Pill>
    );
  }

  return (
    <Pill tone={kind} size={size} className={className}>
      {meta.label}
    </Pill>
  );
}