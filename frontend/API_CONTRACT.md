# MediQuery API contract

What the frontend expects from the backend. The TypeScript source of truth is
`frontend/lib/types.ts`; this file shows the same shapes as JSON.

- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- All responses are JSON. Errors use FastAPI's shape: `{ "detail": "Case not found" }`
- Times are ISO 8601 strings in UTC, e.g. `"2026-09-25T15:21:02Z"`
- **CORS:** the browser calls the API directly, so allow origin `http://localhost:3000`
  (`GET`, `POST`, `OPTIONS`).

Allowed values:

| Field | Values |
| --- | --- |
| `kind` | `xray`, `mri`, `ct`, `prescription` |
| agent ids | `extraction`, `orchestrator`, `xray`, `mri`, `ct`, `document`, `narrator` |
| agent status | `pending`, `active`, `done`, `skipped`, `failed` |
| run status | `queued`, `running`, `complete`, `failed`, `cancelled` |

---

## `GET /health`

Checked by the sidebar every 15 s.

```json
{ "status": "ok", "modelsLoaded": 5 }
```

## `POST /cases`

Upload a case and start the run. `multipart/form-data` with:

- `patient`: a JSON string `{ "nameOrId": "Demo 01", "age": "54", "sex": "unspecified" | "female" | "male", "notes": "" }`
- `files`: one or more files (repeat the field)

```json
{ "caseId": "MQ-0142" }
```

## `GET /cases/{caseId}/run`

Polled every 2 s until `status` is `complete`, `failed` or `cancelled`.
Return `404` for an unknown case.

```json
{
  "caseId": "MQ-0142",
  "patientName": "Demo patient 01",
  "status": "running",
  "startedAt": "2026-09-25T15:21:00Z",
  "files": [
    { "id": "f1", "name": "chest_pa_aug.dcm", "kind": "xray", "description": "DICOM · chest, PA view", "sizeBytes": 2516582 }
  ],
  "agents": {
    "extraction": "done",
    "orchestrator": "done",
    "xray": "active",
    "document": "done",
    "narrator": "pending"
  },
  "routing": [
    {
      "fileName": "chest_pa_aug.dcm",
      "kind": "xray",
      "model": "lung-seg → chest-xray-cls",
      "reason": "Chest, PA view",
      "status": "Running",
      "progress": 40
    }
  ],
  "log": [
    { "time": "2026-09-25T15:21:02Z", "agent": "extraction", "message": "5 files received" }
  ],
  "summary": null,
  "error": null
}
```

Notes:
- Agents you leave out of `agents` show as "Waiting".
- A specialist whose file kind isn't in `files` is shown as "Skipped" automatically.
- `summary` stays `null` until the Narrator has written it.
- When `status` is `failed`, put a readable message in `error`.

## `POST /cases/{caseId}/cancel`

Stop a run that is still going.

```json
{ "ok": true }
```

## `GET /cases/{caseId}/report`

Return `409` while the run is still going, `404` for an unknown case.

```json
{
  "caseId": "MQ-0142",
  "patientName": "Demo patient 01",
  "finishedAt": "2026-09-25T15:21:48Z",
  "fileCount": 5,
  "modelCount": 5,
  "agentCount": 7,
  "summary": "We went through three scans and two prescriptions…",
  "flags": [
    { "text": "Chest X-ray: pneumonia score 0.71, above the 0.50 flag line", "source": "xray" }
  ],
  "trail": [
    { "agent": "X-ray agent", "used": "lung-seg · chest-xray-cls", "seconds": 3.8 }
  ],
  "scans": [
    {
      "fileName": "chest_pa_aug.dcm",
      "kind": "xray",
      "model": "chest-xray-cls",
      "scores": [
        { "label": "Pneumonia", "score": 0.71, "flagged": true },
        { "label": "Normal", "score": 0.29, "flagged": false }
      ],
      "previewUrl": "http://localhost:8000/cases/MQ-0142/files/f1/preview.png",
      "heatmapUrl": "http://localhost:8000/cases/MQ-0142/files/f1/heatmap.png"
    }
  ],
  "medications": [
    {
      "name": "Amoxicillin",
      "dose": "500 mg",
      "frequency": "3 times a day",
      "duration": "5 days",
      "sourceFile": "prescription_aug.pdf",
      "readClearly": true
    }
  ]
}
```

`previewUrl` and `heatmapUrl` are optional. Without them the card shows "No preview available".
