import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** "error" uses red styling for failures; "empty" is neutral. */
  tone?: "empty" | "error";
  icon?: IconName;
  /** Buttons or links, e.g. "Start a new case" or "Try again". */
  action?: ReactNode;
}

/** A centred message for "nothing here yet" and "something went wrong". */
export function EmptyState({ title, description, tone = "empty", icon, action }: EmptyStateProps) {
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border px-6 py-14 text-center",
        isError ? "border-danger-border bg-danger-soft/40" : "border-dashed border-outline-dim bg-card",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-box",
          isError ? "bg-danger-soft text-danger" : "bg-accent-chip text-accent-text",
        )}
      >
        <Icon name={icon ?? (isError ? "warning" : "runs")} size={22} />
      </span>
      <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
      {description && <p className="m-0 max-w-md text-[15px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
