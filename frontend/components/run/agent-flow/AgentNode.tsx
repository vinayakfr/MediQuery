import type { CSSProperties } from "react";
import { StatusPill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import type { AgentDefinition, AgentStatus, FileKind } from "@/lib/types";

interface Props {
  agent: AgentDefinition;
  status: AgentStatus;
  /** Absolute position on the flow canvas (from layout.ts). */
  style: CSSProperties;
  /** "stage" = big box (Extraction, Orchestrator, Narrator). "specialist" = compact box. */
  variant?: "stage" | "specialist";
}

/** Border, background and glow for each status. */
const STATUS_STYLES: Record<AgentStatus, string> = {
  done: "border border-line bg-raised",
  active: "border-[1.5px] border-accent bg-accent-deep shadow-active",
  pending: "border-[1.5px] border-dashed border-outline-dim bg-[#131518]",
  skipped: "border-[1.5px] border-dashed border-[#26292e] bg-[#0f1012] opacity-40",
  failed: "border-[1.5px] border-danger-border bg-danger-soft",
};

/** Dot colour next to each specialist's name, matching its file kind. */
const KIND_DOT: Record<FileKind, string> = {
  xray: "bg-xray",
  mri: "bg-mri",
  ct: "bg-ct",
  prescription: "bg-prescription",
};

/** One box in the flow chart. Its border and glow change with the agent's status. */
export function AgentNode({ agent, status, style, variant = "stage" }: Props) {
  const isSpecialist = variant === "specialist";

  return (
    <div
      role="group"
      aria-label={`${agent.name}: ${status}`}
      style={style}
      className={cn(
        "absolute flex flex-col transition-all duration-250",
        isSpecialist ? "gap-[5px] rounded-box px-3.5 py-[11px]" : "gap-[7px] rounded-2xl p-3.5",
        STATUS_STYLES[status],
      )}
    >
      {isSpecialist ? (
        <>
          <div className="flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-[7px] text-sm font-semibold">
              <span className={cn("size-2 rounded-full", agent.handles && KIND_DOT[agent.handles])} />
              {agent.name}
            </span>
            <StatusPill status={status} />
          </div>
          <span className="text-xs leading-[1.4] text-muted">{agent.steps}</span>
          <span className="mt-auto font-mono text-[10px] text-accent-text">{agent.tools}</span>
        </>
      ) : (
        <>
          <span className="text-[15px] font-semibold">{agent.name}</span>
          <div>
            <StatusPill status={status} />
          </div>
          <span className="text-xs leading-[1.4] text-muted">{agent.description}</span>
          <span className="mt-auto font-mono text-[10px] text-subtle">{agent.tools}</span>
        </>
      )}
    </div>
  );
}
