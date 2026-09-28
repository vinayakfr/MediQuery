from typing import Literal

from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


# Allowed values

FileKind = Literal["xray", "mri", "ct", "prescription"]

AgentId = Literal[
    "extraction",
    "orchestrator",
    "xray",
    "mri",
    "ct",
    "document",
    "narrator",
]

AgentStatus = Literal[
    "pending",
    "active",
    "done",
    "skipped",
    "failed",
]

RunStatus = Literal[
    "queued",
    "running",
    "complete",
    "failed",
    "cancelled",
]

Sex = Literal["unspecified", "female", "male"]


class Patient(ApiModel):
    name_or_id: str
    age: str
    sex: Sex
    notes: str


class CaseFile(ApiModel):
    id: str
    name: str
    kind: FileKind
    description: str
    size_bytes: int


class RoutingItem(ApiModel):
    file_name: str
    kind: FileKind
    model: str
    reason: str
    status: str
    progress: int


class LogItem(ApiModel):
    time: str
    agent: AgentId
    message: str


class RunSnapshot(ApiModel):
    case_id: str
    patient_name: str
    status: RunStatus
    started_at: str
    files: list[CaseFile]
    agents: dict[AgentId, AgentStatus]
    routing: list[RoutingItem]
    log: list[LogItem]
    summary: str | None
    error: str | None


class CaseCreateResponse(ApiModel):
    case_id: str


class CancelResponse(ApiModel):
    ok: bool


class ReportFlag(ApiModel):
    text: str
    source: AgentId


class ReportTrail(ApiModel):
    agent: str
    used: str
    seconds: float


class ScanScore(ApiModel):
    label: str
    score: float
    flagged: bool


class ReportScan(ApiModel):
    file_name: str
    kind: FileKind
    model: str
    scores: list[ScanScore]
    preview_url: str | None = None
    heatmap_url: str | None = None


class Medication(ApiModel):
    name: str
    dose: str
    frequency: str
    duration: str
    source_file: str
    read_clearly: bool


class CaseReport(ApiModel):
    case_id: str
    patient_name: str
    finished_at: str
    file_count: int
    model_count: int
    agent_count: int
    summary: str
    flags: list[ReportFlag]
    trail: list[ReportTrail]
    scans: list[ReportScan]
    medications: list[Medication]