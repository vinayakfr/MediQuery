from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from .schemas import (
    CaseFile,
    CaseReport,
    Medication,
    Patient,
    ReportFlag,
    ReportScan,
    ReportTrail,
    RoutingItem,
    RunSnapshot,
    RunStatus,
)


DATA_DIR = Path("data/cases")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@dataclass
class CaseRecord:
    id: str
    patient: Patient
    status: RunStatus = "queued"

    files: list[CaseFile] = field(default_factory=list)

    agents: dict = field(default_factory=dict)

    routing: list[RoutingItem] = field(
        default_factory=list
    )

    log: list = field(
        default_factory=list
    )

    summary: str | None = None

    medications: list[Medication] = field(
        default_factory=list
    )

    scans: list[ReportScan] = field(
        default_factory=list
    )

    flags: list[ReportFlag] = field(
        default_factory=list
    )

    trail: list[ReportTrail] = field(
        default_factory=list
    )


class CaseStore:
    def __init__(self):
        self.cases: dict[str, CaseRecord] = {}
        self.next_id = 142

    def create_case(self, patient: Patient) -> CaseRecord:
        case_id = f"MQ-{self.next_id:04d}"
        self.next_id += 1

        case = CaseRecord(
            id=case_id,
            patient=patient,
        )

        self.cases[case_id] = case
        return case

    def get_case(self, case_id: str) -> CaseRecord | None:
        return self.cases.get(case_id)

    def to_snapshot(self, case: CaseRecord) -> RunSnapshot:
        return RunSnapshot(
            case_id=case.id,
            patient_name=case.patient.name_or_id,
            status=case.status,
            started_at=utc_now(),
            files=case.files,
            agents=case.agents,
            routing=case.routing,
            log=case.log,
            summary=case.summary,
            error=None,
        )
    
    def build_report(self, case: CaseRecord, base_url: str) -> CaseReport:

        scans = []

        for scan in case.scans:

            file = next(
                (
                    item
                    for item in case.files
                    if item.name == scan.file_name
                ),
                None,
            )

            preview_url = None

            if file is not None:
                preview_url = (
                    f"{base_url}"
                    f"/cases/{case.id}"
                    f"/files/{file.id}"
                    f"/preview.png"
                )

            scans.append(
                scan.model_copy(
                    update={
                        "preview_url": preview_url
                    }
                )
            )

        return CaseReport(
            case_id=case.id,
            patient_name=case.patient.name_or_id,
            finished_at=utc_now(),
            file_count=len(case.files),
            model_count=len(case.scans),
            agent_count=sum(
                1
                for status in case.agents.values()
                if status == "done"
            ),
            summary=case.summary or "",
            flags=case.flags,
            trail=case.trail,
            scans=scans,
            medications=case.medications,
        )

case_store = CaseStore()