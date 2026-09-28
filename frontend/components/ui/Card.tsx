import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  /** Heading shown at the top of the card. Also labels the section for screen readers. */
  title?: ReactNode;
  /** Optional small text under the title. */
  subtitle?: ReactNode;
  /** Optional content on the right of the title row (a button, a count…). */
  action?: ReactNode;
  /** "dark" is used for the terminal-like agent log. */
  tone?: "default" | "dark";
  className?: string;
  children: ReactNode;
}

/** The rounded surface every section of the app sits on. */
export function Card({ title, subtitle, action, tone = "default", className, children }: CardProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-card border",
        tone === "dark" ? "border-[#22252a] bg-terminal p-5" : "border-card-border bg-card p-6",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center gap-4">
          <div className="flex min-w-0 grow flex-col gap-1">
            {title && (
              <h2 id={headingId} className="m-0 font-display text-xl font-semibold">
                {title}
              </h2>
            )}
            {subtitle && <p className="m-0 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
