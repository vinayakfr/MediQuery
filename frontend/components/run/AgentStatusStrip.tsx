import { ALL_AGENTS } from "@/lib/agents";
import { cn } from "@/lib/cn";
import type { FlowState } from "@/lib/run-state";
import type { AgentId, AgentStatus } from "@/lib/types";

/** Dot style per status. Working agents pulse so they stand out in the closed card. */
const DOT: Record<AgentStatus, string> = {
  done: "bg-success",
  active: "bg-accent shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-shimmer",
  pending: "border border-outline-dim",
  failed: "bg-danger",
  skipped: "",
};

/** Look up one agent's status in the flow state. */
function statusFor(flow: FlowState, id: AgentId): AgentStatus {
  if (id === "extraction") return flow.extraction;
  if (id === "orchestrator") return flow.orchestrator;
  if (id === "narrator") return flow.narrator;
  return flow.specialists[id] ?? "pending";
}

/**
 * A one-line version of the flow chart: every agent as a dot and a short name.
 * Shown in the Live agent flow header while the card is collapsed.
 */
export function AgentStatusStrip({ flow }: { flow: FlowState }) {
  const agents = ALL_AGENTS.map((agent) => ({ agent, status: statusFor(flow, agent.id) })).filter(
    ({ status }) => status !== "skipped",
  );

  return (
    <ol aria-label="Agent progress" className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-1.5 p-0">
      {agents.map(({ agent, status }, index) => (
        <li key={agent.id} className="flex items-center gap-1.5 text-[13px]">
          {index > 0 && <span aria-hidden="true" className="mr-1.5 h-px w-3 bg-line" />}
          <span className={cn("size-2 rounded-full", DOT[status])} />
          <span className={status === "active" ? "font-semibold text-ink" : "text-muted"}>
            {agent.name.replace(/ agent$/, "")}
          </span>
          <span className="sr-only">: {status}</span>
        </li>
      ))}
    </ol>
  );
}
