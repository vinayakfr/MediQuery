import { EXTRACTION_AGENT, NARRATOR_AGENT, ORCHESTRATOR_AGENT, SPECIALIST_AGENTS } from "@/lib/agents";
import { connectorInto, connectorToNarrator, type FlowState } from "@/lib/run-state";
import type { CaseFile } from "@/lib/types";
import { AgentNode } from "./AgentNode";
import { FlowConnectors } from "./FlowConnectors";
import { InputsNode } from "./InputsNode";
import { boxStyle, CANVAS, COLUMN_LABELS, EXTRACTION_BOX, NARRATOR_BOX, ORCHESTRATOR_BOX, specialistBox } from "./layout";
import { SummaryNode } from "./SummaryNode";

interface Props {
  flow: FlowState;
  files: CaseFile[];
  /** The Narrator's summary; null until it has been written. */
  summary: string | null;
}

/**
 * The live architecture diagram:
 *   Input → Extraction → Orchestrator → specialists → Narrator → Summary
 *
 * Purely presentational: it draws whatever `flow` says. `flow` is derived
 * from the backend's RunSnapshot by getFlowState() in lib/run-state.ts.
 * The canvas has a fixed size and scrolls sideways on narrow screens.
 */
export function AgentFlow({ flow, files, summary }: Props) {
  const specialistStatuses = SPECIALIST_AGENTS.map((agent) => flow.specialists[agent.id]);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="relative mx-auto" style={{ width: CANVAS.width, height: CANVAS.height }}>
        {COLUMN_LABELS.map((label) => (
          <div key={label.text} className="absolute top-0 text-xs font-semibold text-subtle" style={{ left: label.x }}>
            {label.text}
          </div>
        ))}

        <FlowConnectors
          toExtraction={connectorInto(flow.extraction)}
          toOrchestrator={connectorInto(flow.orchestrator)}
          toSpecialists={specialistStatuses.map(connectorInto)}
          toNarrator={specialistStatuses.map((status) => connectorToNarrator(status, flow.narrator))}
          toSummary={flow.summaryReady ? "done" : "idle"}
        />

        <InputsNode files={files} />
        <AgentNode agent={EXTRACTION_AGENT} status={flow.extraction} style={boxStyle(EXTRACTION_BOX)} />
        <AgentNode agent={ORCHESTRATOR_AGENT} status={flow.orchestrator} style={boxStyle(ORCHESTRATOR_BOX)} />

        {SPECIALIST_AGENTS.map((agent, index) => (
          <AgentNode
            key={agent.id}
            agent={agent}
            status={specialistStatuses[index]}
            style={boxStyle(specialistBox(index))}
            variant="specialist"
          />
        ))}

        <AgentNode agent={NARRATOR_AGENT} status={flow.narrator} style={boxStyle(NARRATOR_BOX)} />
        <SummaryNode summary={flow.summaryReady ? summary : null} />
      </div>
    </div>
  );
}
