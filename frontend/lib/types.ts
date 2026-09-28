/**
 * Shared domain types for MediQuery: the contract between this frontend and
 * the backend (FastAPI on localhost:8000). The backend should return JSON in
 * exactly these shapes. API_CONTRACT.md has an example for every endpoint.
 *
 * Times are ISO 8601 strings (e.g. "2026-09-25T20:51:02Z"); the UI formats them.
 */

/** The kinds of medical file the platform understands. */
export type FileKind = "xray" | "mri" | "ct" | "prescription";

/** Every agent in the pipeline, by id. Must match the ids the backend sends. */
export type AgentId = "extraction" | "orchestrator" | "xray" | "mri" | "ct" | "document" | "narrator";

/** Lifecycle state of a single agent. */
export type AgentStatus = "pending" | "active" | "done" | "skipped" | "failed";

/** Lifecycle state of a whole run. */
export type RunStatus = "queued" | "running" | "complete" | "failed" | "cancelled";

/** The five stages of the pipeline, left to right in the flow chart. */
export type PipelineStage = "input" | "extraction" | "orchestration" | "processing" | "synthesis";

/* ---------- Requests ---------- */

/** Basic patient details entered on the New case screen (sent with POST /cases). */
export interface PatientDetails {
  nameOrId: string;
  age: string;
  sex: "unspecified" | "female" | "male";
  notes: string;
}

/* ---------- Shared pieces ---------- */

/** A file attached to a case, after the Extraction agent has typed it. */
export interface CaseFile {
  id: string;
  name: string;
  kind: FileKind;
  /** Human-readable description, e.g. "DICOM · chest, PA view". */
  description: string;
  sizeBytes: number;
}

/** Static, UI-side description of an agent (see lib/agents.ts). */
export interface AgentDefinition {
  id: AgentId;
  name: string;
  stage: PipelineStage;
  description: string;
  /** Short "how it works" line, e.g. "Segment lungs → classify". */
  steps?: string;
  /** Models or libraries the agent relies on. */
  tools: string;
  /** For specialist agents: the file kind that activates them. */
  handles?: FileKind;
}

/** One row of the "Which model got which file" table. */
export interface RoutingDecision {
  fileName: string;
  kind: FileKind;
  model: string;
  reason: string;
  /** Free text from the backend, e.g. "Done · 3.8 s" or "Slice 9 of 16". */
  status: string;
  progress: number; // 0–100
}

/** One line in the live agent log. */
export interface AgentLogEntry {
  time: string; // ISO 8601
  agent: string;
  message: string;
}

/* ---------- GET /cases/:id/run ---------- */

export interface RunSnapshot {
  caseId: string;
  patientName: string;
  status: RunStatus;
  startedAt: string; // ISO 8601
  files: CaseFile[];
  /** Status of each agent. Agents that are missing are treated as "pending". */
  agents: Partial<Record<AgentId, AgentStatus>>;
  routing: RoutingDecision[];
  log: AgentLogEntry[];
  /** The Narrator's plain-language summary. null until it has been written. */
  summary: string | null;
  /** Set when status is "failed". */
  error?: string | null;
}

/* ---------- GET /cases/:id/report ---------- */

/** A single label and score from a classification model. */
export interface ModelScore {
  label: string;
  score: number; // 0–1
  /** True when this label is the one worth flagging to a clinician. */
  flagged: boolean;
}

/** Findings for one imaging file. */
export interface ScanFinding {
  fileName: string;
  kind: FileKind;
  model: string;
  scores: ModelScore[];
  /** Optional image URLs served by the backend (the scan and the model's attention map). */
  previewUrl?: string | null;
  heatmapUrl?: string | null;
}

/** Something the Narrator agent thinks deserves a second look. */
export interface ReportFlag {
  text: string;
  source: FileKind;
}

/** One medicine extracted from a prescription. */
export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  sourceFile: string;
  /** False when OCR confidence was low and a human should check it. */
  readClearly: boolean;
}

/** One entry of the "Who did what" trail. */
export interface AgentTrailEntry {
  agent: string;
  used: string;
  seconds: number;
}

export interface CaseReport {
  caseId: string;
  patientName: string;
  finishedAt: string; // ISO 8601
  fileCount: number;
  modelCount: number;
  agentCount: number;
  summary: string;
  flags: ReportFlag[];
  trail: AgentTrailEntry[];
  scans: ScanFinding[];
  medications: Medication[];
}

/* ---------- GET /health ---------- */

export interface HealthStatus {
  status: "ok";
  /** Number of models the backend has loaded and ready. */
  modelsLoaded: number;
}
