import type { AgentDefinition } from "./types";

/**
 * The agent architecture, defined once and reused by every screen.
 *
 *   Input → Extraction → Orchestrator → 4 specialists (in parallel) → Narrator → Summary
 *
 * To add a new specialist (say, an ultrasound agent), add it to SPECIALIST_AGENTS
 * and give it a slot in components/run/agent-flow/layout.ts.
 */

export const EXTRACTION_AGENT: AgentDefinition = {
  id: "extraction",
  name: "Extraction agent",
  stage: "extraction",
  description: "Works out what each file is and pulls out text and metadata.",
  tools: "pydicom · nibabel · pdfplumber",
};

export const ORCHESTRATOR_AGENT: AgentDefinition = {
  id: "orchestrator",
  name: "Orchestrator",
  stage: "orchestration",
  description: "Sends each file to the right specialist, all at once.",
  tools: "LLM planner + registry",
};

/** Specialists run in parallel. Each one only wakes up for its file kind. */
export const SPECIALIST_AGENTS: AgentDefinition[] = [
  {
    id: "xray",
    name: "X-ray agent",
    stage: "processing",
    handles: "xray",
    description: "Segments the lungs, then classifies the chest X-ray.",
    steps: "Segment lungs → classify",
    tools: "lung-seg · chest-xray-cls",
  },
  {
    id: "mri",
    name: "MRI agent",
    stage: "processing",
    handles: "mri",
    description: "Samples slices from the volume and checks for tumours.",
    steps: "Sample slices → tumour check",
    tools: "brain-mri-tumor-cls",
  },
  {
    id: "ct",
    name: "CT agent",
    stage: "processing",
    handles: "ct",
    description: "Samples slices from the CT series and classifies them.",
    steps: "Sample 16 slices → classify",
    tools: "ct-abdomen-cls",
  },
  {
    id: "document",
    name: "Document agent",
    stage: "processing",
    handles: "prescription",
    description: "Reads prescriptions and pulls out medicines and doses.",
    steps: "OCR → find medicines",
    tools: "trocr · biomedical-ner-all",
  },
];

export const NARRATOR_AGENT: AgentDefinition = {
  id: "narrator",
  name: "Narrator agent",
  stage: "synthesis",
  description: "Merges and cross-checks every result, then writes it up in plain language.",
  tools: "LLM · report writer",
};

/** Every agent in pipeline order. Handy for counts and the "next steps" list. */
export const ALL_AGENTS: AgentDefinition[] = [
  EXTRACTION_AGENT,
  ORCHESTRATOR_AGENT,
  ...SPECIALIST_AGENTS,
  NARRATOR_AGENT,
];
