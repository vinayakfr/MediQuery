"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { formatTime } from "@/lib/format";
import type { AgentLogEntry } from "@/lib/types";

interface Props {
  entries: AgentLogEntry[];
  /** Shows the "live" badge while the run is still going. */
  isLive: boolean;
}

/** "Agent chatter": a terminal-style feed of what each agent is doing. Scrolls to the newest line. */
export function AgentLog({ entries, isLive }: Props) {
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the newest line in view as the backend appends more.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [entries.length]);

  return (
    <Card
      title="Agent chatter"
      tone="dark"
      className="flex-[0_1_430px]"
      action={
        isLive && (
          <Pill tone="info" size="sm" dot glow>
            live
          </Pill>
        )
      }
    >
      {entries.length === 0 ? (
        <p className="m-0 font-mono text-xs text-subtle">Waiting for the first message…</p>
      ) : (
        // role="log" tells screen readers new lines may be appended here.
        <ol ref={listRef} role="log" className="m-0 flex max-h-[360px] list-none flex-col gap-2 overflow-y-auto p-0 font-mono text-xs leading-[1.45]">
          {entries.map((entry, index) => (
            <li key={`${entry.time}-${index}`} className="flex gap-2.5">
              <span className="shrink-0 text-faint">{formatTime(entry.time, true)}</span>
              <span className="w-[76px] shrink-0 truncate text-link">{entry.agent}</span>
              <span className="text-ink-soft">{entry.message}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
