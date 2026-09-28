"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export type BackendHealth =
  | { state: "checking" }
  | { state: "up"; modelsLoaded: number }
  | { state: "down" };

/** Pings GET /health on load and then every `intervalMs`, for the sidebar status box. */
export function useBackendHealth(intervalMs = 15_000): BackendHealth {
  const [health, setHealth] = useState<BackendHealth>({ state: "checking" });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const result = await getHealth();
        if (!cancelled) setHealth({ state: "up", modelsLoaded: result.modelsLoaded });
      } catch {
        if (!cancelled) setHealth({ state: "down" });
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return health;
}
