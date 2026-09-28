import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/Card";
import type { AgentTrailEntry } from "@/lib/types";

/** "Who did what": each agent, the tools it used and how long it took. */
export function AgentTrail({ trail }: { trail: AgentTrailEntry[] }) {
  // Specialists run in parallel, so wall-clock time is shorter than this sum.
  const totalSeconds = trail.reduce((sum, entry) => sum + entry.seconds, 0);

  return (
    <Card title="Who did what" className="flex-[0_1_340px]">
      <ol className="m-0 flex list-none flex-col p-0">
        {trail.map((entry) => (
          <li key={entry.agent} className="flex gap-3 border-b border-line-soft py-[9px]">
            <Icon name="check" size={16} strokeWidth={2.6} className="mt-[3px] shrink-0 text-success" />
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <span className="text-[15px] font-semibold">{entry.agent}</span>
              <span className="font-mono text-xs text-subtle">{entry.used}</span>
            </span>
            <span className="font-mono text-xs text-muted">{entry.seconds.toFixed(1)} s</span>
          </li>
        ))}
      </ol>
      <p className="m-0 text-sm text-muted">{totalSeconds.toFixed(1)} s of agent time, on your CPU</p>
    </Card>
  );
}
