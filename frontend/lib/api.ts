import type { CaseReport, HealthStatus, PatientDetails, RunSnapshot } from "./types";

/**
 * API client for the MediQuery backend.
 *
 * Every function here talks to the real backend. Set the address in
 * frontend/.env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000
 *
 * These functions are called both from server components (report page) and
 * from the browser (upload, live run polling, health check), so the backend
 * must allow CORS from http://localhost:3000.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/** Thrown for any failed request. `status` is 0 when the backend could not be reached. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** True when the backend is down or unreachable, rather than returning an error. */
  get isNetworkError() {
    return this.status === 0;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

/** One place for fetch, timeouts, JSON parsing and error handling. */
async function request<T>(path: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = init;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: "no-store", // run data changes constantly; never cache it
      signal: AbortSignal.timeout(timeoutMs),
      ...fetchInit,
    });
  } catch {
    throw new ApiError(`Couldn't reach the backend at ${API_URL}. Is it running?`, 0);
  }

  if (!response.ok) {
    // FastAPI puts error messages in { "detail": "..." }.
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : response.statusText;
    throw new ApiError(detail || `Request failed (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}

/** POST /cases: upload files and patient details, and start a run. */
export async function createCase(patient: PatientDetails, files: File[]): Promise<{ caseId: string }> {
  const body = new FormData();
  body.append("patient", JSON.stringify(patient));
  files.forEach((file) => body.append("files", file));

  // Uploads can be large (MRI volumes), so allow longer than usual.
  return request<{ caseId: string }>("/cases", { method: "POST", body, timeoutMs: 120_000 });
}

/** GET /cases/:id/run: current state of a run. Polled while the run is in progress. */
export function getRun(caseId: string): Promise<RunSnapshot> {
  return request<RunSnapshot>(`/cases/${encodeURIComponent(caseId)}/run`);
}

/** POST /cases/:id/cancel: stop a run that is still going. */
export function cancelRun(caseId: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/cases/${encodeURIComponent(caseId)}/cancel`, { method: "POST" });
}

/** GET /cases/:id/report: the finished report. Returns 409 while the run is still going. */
export function getReport(caseId: string): Promise<CaseReport> {
  return request<CaseReport>(`/cases/${encodeURIComponent(caseId)}/report`);
}

/** GET /health: is the backend up, and how many models are loaded? */
export function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/health", { timeoutMs: 4_000 });
}
