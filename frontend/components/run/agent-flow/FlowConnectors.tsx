import { cn } from "@/lib/cn";
import type { ConnectorState } from "@/lib/run-state";
import { CANVAS, groupOutlines, PATHS } from "./layout";

interface Props {
  toExtraction: ConnectorState;
  toOrchestrator: ConnectorState;
  /** One entry per specialist, in the same order as SPECIALIST_AGENTS. */
  toSpecialists: ConnectorState[];
  toNarrator: ConnectorState[];
  toSummary: ConnectorState;
}

/** How each connector state is drawn. "flowing" uses the animate-flow utility from globals.css. */
const LINE_STYLES: Record<ConnectorState, string> = {
  idle: "stroke-input",
  done: "stroke-accent-done",
  skipped: "stroke-[#2a2d32] [stroke-dasharray:2_7]",
  flowing: "stroke-accent-flow [stroke-width:2.5] [stroke-dasharray:7_7] animate-flow",
};

/** Every line in the flow chart, drawn as a single SVG layer behind the boxes. */
export function FlowConnectors({ toExtraction, toOrchestrator, toSpecialists, toNarrator, toSummary }: Props) {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={CANVAS.width}
      height={CANVAS.height}
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      aria-hidden="true"
    >
      {/* Dashed outlines around the extraction and processing pipelines */}
      {groupOutlines(toSpecialists.length).map((box, i) => (
        <rect
          key={i}
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={20}
          className="fill-none stroke-[#26292e] [stroke-dasharray:4_6]"
        />
      ))}

      <Line d={PATHS.inputToExtraction} state={toExtraction} />
      <Line d={PATHS.extractionToOrchestrator} state={toOrchestrator} />
      {toSpecialists.map((state, i) => (
        <Line key={`in-${i}`} d={PATHS.orchestratorToSpecialist(i)} state={state} />
      ))}
      {toNarrator.map((state, i) => (
        <Line key={`out-${i}`} d={PATHS.specialistToNarrator(i)} state={state} />
      ))}
      <Line d={PATHS.narratorToSummary} state={toSummary} />
    </svg>
  );
}

function Line({ d, state }: { d: string; state: ConnectorState }) {
  return <path d={d} className={cn("fill-none stroke-2 transition-[stroke] duration-250", LINE_STYLES[state])} />;
}
