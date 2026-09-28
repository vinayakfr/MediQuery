"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getRun } from "@/lib/api";
import { isRunFinished } from "@/lib/run-state";
import type { RunSnapshot } from "@/lib/types";

interface State {
  run: RunSnapshot | null;
  error: ApiError | null;
  isLoading: boolean;
}

/**
 * Keeps a run up to date by polling GET /cases/:id/run.
 *
 * - Polls every `intervalMs` while the run is queued or running.
 * - Stops by itself once the run is complete, failed or cancelled.
 * - Keeps showing the last good snapshot if one poll fails, and retries.
 *
 * If the backend later offers Server-Sent Events or a WebSocket, only this
 * hook needs to change: components just read `run`.
 */
export function useRunPolling(caseId: string, intervalMs = 2000) {
  const [state, setState] = useState<State>({ run: null, error: null, isLoading: true });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pollKey, setPollKey] = useState(0); // bump to restart polling

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const run = await getRun(caseId);
        if (cancelled) return;
        setState({ run, error: null, isLoading: false });
        if (!isRunFinished(run.status)) timer.current = setTimeout(poll, intervalMs);
      } catch (error) {
        if (cancelled) return;
        const apiError = error instanceof ApiError ? error : new ApiError("Something went wrong", 0);
        setState((previous) => ({ ...previous, error: apiError, isLoading: false }));
        // A missing case won't appear by retrying; anything else might recover.
        if (apiError.status !== 404) timer.current = setTimeout(poll, intervalMs * 2);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [caseId, intervalMs, pollKey]);

  /** Fetch again right away (e.g. after cancelling, or from a "Try again" button). */
  const refresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setPollKey((key) => key + 1);
  }, []);

  return { ...state, refresh };
}
