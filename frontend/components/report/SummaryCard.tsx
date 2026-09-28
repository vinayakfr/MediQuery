import { Card } from "@/components/ui/Card";
import { KindBadge } from "@/components/ui/Pill";
import type { ReportFlag } from "@/lib/types";

interface Props {
  summary: string;
  flags: ReportFlag[];
}

/** "The short version": the Narrator's summary plus anything worth a second look. */
export function SummaryCard({ summary, flags }: Props) {
  return (
    <Card
      title="The short version"
      action={<span className="text-[13px] text-subtle">Written by the Narrator agent</span>}
      className="flex-[1_1_560px]"
    >
      <p className="m-0 max-w-[760px] text-base leading-[1.65] text-ink-soft">{summary}</p>

      {flags.length > 0 && (
        <>
          <h3 className="mt-1 mb-0 text-base font-semibold">Worth a second look</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {flags.map((flag) => (
              <li key={flag.text} className="flex items-center gap-3 rounded-xl bg-raised px-3.5 py-3">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <span className="grow text-[15px]">{flag.text}</span>
                <KindBadge kind={flag.source} size="md" />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
