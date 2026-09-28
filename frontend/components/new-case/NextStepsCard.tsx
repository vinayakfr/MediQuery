import { Card } from "@/components/ui/Card";
import { EXTRACTION_AGENT, NARRATOR_AGENT, ORCHESTRATOR_AGENT } from "@/lib/agents";

/**
 * "Here's what happens next": a short, friendly version of the pipeline.
 * The four specialists are grouped into one step because they run together.
 */
const STEPS = [
  { name: EXTRACTION_AGENT.name, text: "Peeks inside each file to tell scans from documents." },
  { name: ORCHESTRATOR_AGENT.name, text: "Picks the best specialist and model for every file." },
  { name: "Specialist agents", text: "X-ray, MRI, CT and Document agents run side by side." },
  { name: NARRATOR_AGENT.name, text: "Puts it all together into one easy report." },
];

export function NextStepsCard() {
  return (
    <Card title="Here's what happens next">
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {STEPS.map((step, index) => (
          <li key={step.name} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-chip text-[13px] font-bold text-accent-text">
              {index + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">{step.name}</span>
              <span className="text-sm leading-[1.45] text-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
