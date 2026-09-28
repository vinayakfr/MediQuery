import { SPECIALIST_AGENTS } from "./agents";
import type { AgentId, AgentStatus, RunSnapshot, RunStatus } from "./types";

/**
 * Pure functions that turn a RunSnapshot from the backend into a status for
 * every box and line in the flow chart. No React here, so it is easy to test.
 */

/** Runs in these states will not change any more, so polling can stop. */
export const FINISHED_RUN_STATUSES: RunStatus[] = ["complete", "failed", "cancelled"];

export function isRunFinished(status: RunStatus): boolean {
  return FINISHED_RUN_STATUSES.includes(status);
}

/** The complete status map the flow chart renders from. */
export interface FlowState {
  extraction: AgentStatus;
  orchestrator: AgentStatus;
  specialists: Record<string, AgentStatus>;
  narrator: AgentStatus;
  summaryReady: boolean;
}

/** An agent the backend hasn't mentioned yet is still waiting. */
function statusOf(run: RunSnapshot, id: AgentId): AgentStatus {
  return run.agents[id] ?? "pending";
}

export function getFlowState(run: RunSnapshot): FlowState {
  const specialists: Record<string, AgentStatus> = {};

  for (const agent of SPECIALIST_AGENTS) {
    // A specialist with no matching file will never run, whatever the backend says.
    const hasWork = run.files.some((file) => file.kind === agent.handles);
    specialists[agent.id] = hasWork ? statusOf(run, agent.id) : "skipped";
  }

  return {
    extraction: statusOf(run, "extraction"),
    orchestrator: statusOf(run, "orchestrator"),
    specialists,
    narrator: statusOf(run, "narrator"),
    summaryReady: Boolean(run.summary),
  };
}

/** How many agents have finished, and how many will run in total. */
export function countAgents(flow: FlowState): { done: number; total: number } {
  const statuses = [flow.extraction, flow.orchestrator, ...Object.values(flow.specialists), flow.narrator].filter(
    (status) => status !== "skipped",
  );

  return {
    done: statuses.filter((status) => status === "done").length,
    total: statuses.length,
  };
}

/** Visual state of a connector line between two boxes. */
export type ConnectorState = "idle" | "flowing" | "done" | "skipped";

/** A line takes the state of the box it points into. */
export function connectorInto(target: AgentStatus): ConnectorState {
  switch (target) {
    case "active":
      return "flowing";
    case "done":
      return "done";
    case "skipped":
      return "skipped";
    default:
      return "idle"; // pending or failed
  }
}

/**
 * A line from a specialist into the Narrator. While the Narrator is still
 * waiting, show which specialists have already handed their results over.
 */
export function connectorToNarrator(specialist: AgentStatus, narrator: AgentStatus): ConnectorState {
  if (specialist === "skipped") return "skipped";
  if (narrator === "pending") return specialist === "done" ? "done" : "idle";
  return connectorInto(narrator);
}
