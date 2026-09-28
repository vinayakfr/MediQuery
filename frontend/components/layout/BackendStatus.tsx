"use client";

import { useBackendHealth } from "@/hooks/useBackendHealth";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/format";

/** The small box at the bottom of the sidebar: is the backend reachable, and how many models are ready? */
export function BackendStatus() {
  const health = useBackendHealth();
  const host = API_URL.replace(/^https?:\/\//, "");

  const title = { checking: "Checking backend…", up: "Backend is up", down: "Backend is down" }[health.state];
  const detail = health.state === "up" ? `${host} · ${pluralize(health.modelsLoaded, "model")} ready` : host;

  return (
    <div role="status" className="mt-auto flex flex-col gap-1.5 rounded-box border border-[#22252a] bg-[#131518] p-3.5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span
          className={cn(
            "size-2 rounded-full",
            health.state === "up" && "bg-success shadow-[0_0_8px_rgba(74,222,128,0.6)]",
            health.state === "down" && "bg-danger",
            health.state === "checking" && "animate-shimmer bg-subtle",
          )}
        />
        {title}
      </div>
      {/* <div className="font-mono text-xs text-subtle">{detail}</div> */}
    </div>
  );
}
