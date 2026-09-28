import { CollapsibleCard } from "@/components/ui/CollapsibleCard";
import type { FlowState } from "@/lib/run-state";
import type { CaseFile } from "@/lib/types";
import { AgentFlow } from "./agent-flow/AgentFlow";
import { AgentStatusStrip } from "./AgentStatusStrip";

interface Props {
  flow: FlowState;
  files: CaseFile[];
  summary: string | null;
  /** Open the chart straight away? Closed by default to keep the page short. */
  defaultOpen?: boolean;
}

/**
 * The Live agent flow as a dropdown. Closed, it shows a one-line status strip;
 * open, it shows the full flow chart with a legend.
 */
export function AgentFlowCard({ flow, files, summary, defaultOpen = false }: Props) {
  return (
    <CollapsibleCard
      title="Live agent flow"
      subtitle="How the agents are passing work along, step by step."
      collapsedSummary={<AgentStatusStrip flow={flow} />}
      defaultOpen={defaultOpen}
    >
      <div className="mb-4 flex justify-end">
        <Legend />
      </div>
      <AgentFlow flow={flow} files={files} summary={summary} />
    </CollapsibleCard>
  );
}

/** Explains the box styles. */
function Legend() {
  const items = [
    { label: "Working", swatch: "border-[1.5px] border-accent bg-accent-deep" },
    { label: "Done", swatch: "border border-outline-dim bg-raised" },
    { label: "Waiting", swatch: "border-[1.5px] border-dashed border-outline-dim" },
    { label: "Skipped", swatch: "border-[1.5px] border-dashed border-[#26292e] opacity-60" },
  ];

  return (
    <ul aria-label="Legend" className="m-0 flex list-none flex-wrap gap-3.5 p-0 text-[13px] text-muted">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className={`size-2.5 rounded-[3px] ${item.swatch}`} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
