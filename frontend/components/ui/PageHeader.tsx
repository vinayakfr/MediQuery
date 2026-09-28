import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Small line above the title, e.g. "Case MQ-0142". */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Line under the title: a description or run status. */
  description?: ReactNode;
  /** Buttons shown on the right. */
  actions?: ReactNode;
}

/** The big heading block at the top of every screen. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
        {eyebrow && <div className="text-sm text-subtle">{eyebrow}</div>}
        <h1 className="m-0 font-display text-[34px] leading-[1.05] font-bold tracking-[-0.02em] md:text-[44px]">{title}</h1>
        {description && <div className="flex flex-wrap items-center gap-2.5 text-base text-muted">{description}</div>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </header>
  );
}
