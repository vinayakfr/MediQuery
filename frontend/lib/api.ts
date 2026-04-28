const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      // Only set Content-Type for JSON bodies; let FormData set its own boundary
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
    } catch {
      // ignore parse failures
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentRecord = {
  id: string;
  filename: string;
  created_at: string;
  mime_type: string;
  ocr_status: "pending" | "queued" | "analyzed" | "completed" | "failed";
  storage_path: string;
  file_size?: number;
};

// ─── Document endpoints ────────────────────────────────────────────────────────

export const documentsApi = {
  list(userId: string) {
    return request<{ documents: DocumentRecord[] }>(
      `/documents?user_id=${encodeURIComponent(userId)}`
    );
  },

  upload(userId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("user_id", userId);
    return request<{ message: string; document: DocumentRecord }>(
      "/upload-document",
      { method: "POST", body: form }
    );
  },

  getDownloadUrl(storagePath: string) {
    return request<{ url: string }>(
      `/download?storage_path=${encodeURIComponent(storagePath)}`
    );
  },

  delete(documentId: string) {
    return request<{ message: string }>(
      `/document/${encodeURIComponent(documentId)}`,
      { method: "DELETE" }
    );
  },
};