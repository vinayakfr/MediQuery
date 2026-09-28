"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";

interface CollapsibleCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Shown in the header while collapsed, so the card is still useful when closed. */
  collapsedSummary?: ReactNode;
  /** Extra controls on the right of the header, next to the toggle. */
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * A Card whose body opens and closes. The whole header row is the toggle
 * button (with aria-expanded), and the body slides open using the CSS grid
 * 0fr → 1fr trick, so no height needs to be measured.
 */
export function CollapsibleCard({ title, subtitle, collapsedSummary, action, defaultOpen = false, children }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section className="flex min-w-0 flex-col rounded-card border border-card-border bg-card">
      <div className="flex items-center gap-4 p-5 md:px-6">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 grow cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-left text-ink"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-muted transition-transform duration-200",
              open && "rotate-180",
            )}
          >
            <Icon name="chevronDown" size={18} />
          </span>
          <span className="flex min-w-0 grow flex-col gap-1">
            <span className="font-display text-xl font-semibold">{title}</span>
            {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
          </span>
        </button>

        {!open && collapsedSummary && <div className="hidden min-w-0 lg:block">{collapsedSummary}</div>}
        {action}
      </div>

      {/* The body stays mounted, so opening is instant and animations keep running. */}
      <div
        id={bodyId}
        inert={!open}
        className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-6 md:px-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
