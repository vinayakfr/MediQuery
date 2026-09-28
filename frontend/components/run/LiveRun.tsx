"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/Pill";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useRunPolling } from "@/hooks/useRunPolling";
import { cancelRun } from "@/lib/api";
import { formatTime, pluralize } from "@/lib/format";
import { countAgents, getFlowState, isRunFinished } from "@/lib/run-state";
import type { RunSnapshot, RunStatus } from "@/lib/types";
import { AgentFlowCard } from "./AgentFlowCard";
import { AgentLog } from "./AgentLog";
import { RoutingTable } from "./RoutingTable";

/**
 * The Live run screen. Polls the backend for the run and shows a loading,
 * error or live view depending on where things are.
 */
export function LiveRun({ caseId }: { caseId: string }) {
  const { run, error, isLoading, refresh } = useRunPolling(caseId);

  if (isLoading) return <PageSkeleton label="Loading run…" />;

  // Only show a full-page error if we have nothing to show at all.
  if (!run) {
    return (
      <EmptyState
        tone="error"
        title={error?.status === 404 ? "We couldn't find that case" : "Couldn't load this run"}
        description={error?.message}
        action={
          <>
            <Button onClick={refresh} icon="replay">
              Try again
            </Button>
            <ButtonLink href="/" variant="secondary">
              Start a new case
            </ButtonLink>
          </>
        }
      />
    );
  }

  return <RunView run={run} connectionLost={Boolean(error)} onChanged={refresh} />;
}

/** Header wording and pill colour for each run status. */
const RUN_STATUS_UI: Record<RunStatus, { title: string; pill: string; tone: "info" | "success" | "danger" | "neutral" }> = {
  queued: { title: "Getting your agents ready", pill: "Queued", tone: "neutral" },
  running: { title: "Your agents are on it", pill: "Running", tone: "info" },
  complete: { title: "All done, report is ready", pill: "Done", tone: "success" },
  failed: { title: "Something went wrong", pill: "Failed", tone: "danger" },
  cancelled: { title: "Run stopped", pill: "Stopped", tone: "neutral" },
};

interface RunViewProps {
  run: RunSnapshot;
  /** True when the latest poll failed but we still have older data on screen. */
  connectionLost: boolean;
  /** Called after an action that changes the run (e.g. stopping it). */
  onChanged: () => void;
}

function RunView({ run, connectionLost, onChanged }: RunViewProps) {
  const [isStopping, setIsStopping] = useState(false);

  const flow = getFlowState(run);
  const { done, total } = countAgents(flow);
  const finished = isRunFinished(run.status);
  const ui = RUN_STATUS_UI[run.status];

  const stop = async () => {
    setIsStopping(true);
    try {
      await cancelRun(run.caseId);
    } finally {
      setIsStopping(false);
      onChanged();
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={`Case ${run.caseId} · ${run.patientName}`}
        title={ui.title}
        description={
          <>
            <Pill tone={ui.tone} dot glow={!finished}>
              {ui.pill}
            </Pill>
            {done} of {total} agents done · {pluralize(run.files.length, "file")} · started {formatTime(run.startedAt)}
          </>
        }
        actions={
          <>
            {!finished && (
              <Button onClick={stop} disabled={isStopping}>
                {isStopping ? "Stopping…" : "Stop run"}
              </Button>
            )}
            {run.status === "complete" ? (
              <ButtonLink href={`/reports?case=${encodeURIComponent(run.caseId)}`} trailingIcon="arrowRight">
                See the report
              </ButtonLink>
            ) : (
              <Button variant="primary" trailingIcon="arrowRight" disabled title="The report is ready once every agent has finished">
                See the report
              </Button>
            )}
          </>
        }
      />

      {connectionLost && (
        <p role="status" className="m-0 rounded-xl border border-warning-border bg-warning-surface px-4 py-2.5 text-sm text-warning-text">
          Lost touch with the backend. Showing the last update and retrying…
        </p>
      )}

      {run.status === "failed" && run.error && (
        <p role="alert" className="m-0 rounded-xl border border-danger-border bg-danger-soft px-4 py-2.5 text-sm text-danger">
          {run.error}
        </p>
      )}

      <AgentFlowCard flow={flow} files={run.files} summary={run.summary} />

      <div className="flex flex-wrap items-stretch gap-5">
        <RoutingTable rows={run.routing} />
        <AgentLog entries={run.log} isLive={!finished} />
      </div>
    </>
  );
}
