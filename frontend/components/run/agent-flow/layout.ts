/**
 * Geometry of the agent flow chart.
 *
 * The chart is drawn on a fixed 1048 × 630 canvas (boxes are absolutely
 * positioned, lines are one SVG on top). On narrow screens the canvas
 * scrolls sideways instead of squashing. All positions live here, so the
 * layout can be tuned without touching any component.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const CANVAS = { width: 1048, height: 630 };

/** Vertical centre line that the single-agent stages sit on. */
const CENTER_Y = 260;

export const INPUT_BOX: Box = { x: 0, y: 105, w: 150, h: 310 };
export const EXTRACTION_BOX: Box = { x: 190, y: 170, w: 170, h: 180 };
export const ORCHESTRATOR_BOX: Box = { x: 400, y: 170, w: 170, h: 180 };
export const NARRATOR_BOX: Box = { x: 870, y: 160, w: 178, h: 200 };
export const SUMMARY_BOX: Box = { x: 0, y: 510, w: 1048, h: 120 };

/** Specialists are stacked in one column, evenly spaced. */
const SPECIALIST_X = 610;
const SPECIALIST_SIZE = { w: 220, h: 100 };
const SPECIALIST_FIRST_Y = 36;
const SPECIALIST_GAP = 16;

export function specialistBox(index: number): Box {
  return {
    x: SPECIALIST_X,
    y: SPECIALIST_FIRST_Y + index * (SPECIALIST_SIZE.h + SPECIALIST_GAP),
    ...SPECIALIST_SIZE,
  };
}

/** Column headings along the top of the chart. */
export const COLUMN_LABELS = [
  { x: INPUT_BOX.x, text: "01 · Input" },
  { x: EXTRACTION_BOX.x, text: "02 · Extraction" },
  { x: ORCHESTRATOR_BOX.x, text: "03 · Orchestration" },
  { x: SPECIALIST_X, text: "04 · Processing" },
  { x: NARRATOR_BOX.x, text: "05 · Synthesis" },
];

/** Dashed outlines that group the extraction and processing pipelines. */
export function groupOutlines(specialistCount: number): Box[] {
  const lastSpecialist = specialistBox(specialistCount - 1);
  return [
    { x: EXTRACTION_BOX.x - 10, y: EXTRACTION_BOX.y - 20, w: EXTRACTION_BOX.w + 20, h: EXTRACTION_BOX.h + 40 },
    { x: SPECIALIST_X - 12, y: SPECIALIST_FIRST_Y - 12, w: SPECIALIST_SIZE.w + 24, h: lastSpecialist.y + lastSpecialist.h - SPECIALIST_FIRST_Y + 24 },
  ];
}

/* ---------- Connector paths ---------- */

const right = (b: Box) => b.x + b.w;
const middle = (b: Box) => b.y + b.h / 2;

/** A straight horizontal line. */
function straight(x1: number, y: number, x2: number): string {
  return `M${x1} ${y} L${x2} ${y}`;
}

/** An S-curve between two points, used where one box fans out to many. */
function curve(x1: number, y1: number, x2: number, y2: number): string {
  const bend = (x2 - x1) / 2;
  return `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
}

export const PATHS = {
  inputToExtraction: straight(right(INPUT_BOX), CENTER_Y, EXTRACTION_BOX.x),
  extractionToOrchestrator: straight(right(EXTRACTION_BOX), CENTER_Y, ORCHESTRATOR_BOX.x),
  orchestratorToSpecialist: (index: number) => {
    const box = specialistBox(index);
    return curve(right(ORCHESTRATOR_BOX), CENTER_Y, box.x, middle(box));
  },
  specialistToNarrator: (index: number) => {
    const box = specialistBox(index);
    return curve(right(box), middle(box), NARRATOR_BOX.x, CENTER_Y);
  },
  narratorToSummary: (() => {
    const x = NARRATOR_BOX.x + NARRATOR_BOX.w / 2;
    return `M${x} ${NARRATOR_BOX.y + NARRATOR_BOX.h} L${x} ${SUMMARY_BOX.y}`;
  })(),
};

/** Inline style for an absolutely positioned box. */
export function boxStyle(b: Box) {
  return { left: b.x, top: b.y, width: b.w, height: b.h };
}
