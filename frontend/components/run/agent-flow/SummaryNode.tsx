import { Icon } from "@/components/icons/Icon";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import { boxStyle, SUMMARY_BOX } from "./layout";

/** The final output of the pipeline: the Narrator agent's plain-language summary (null until written). */
export function SummaryNode({ summary }: { summary: string | null }) {
  const ready = Boolean(summary);

  return (
    <div
      role="group"
      aria-label="Summary"
      aria-live="polite"
      style={boxStyle(SUMMARY_BOX)}
      className={cn(
        "absolute flex gap-4 overflow-y-auto rounded-2xl px-[18px] py-4 transition-colors duration-250",
        ready ? "border border-accent-line bg-[#121a28]" : "border-[1.5px] border-dashed border-outline-dim bg-[#131518]",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-chip text-accent-text">
        <Icon name="message" size={20} />
      </span>
      <div className="flex min-w-0 grow flex-col gap-1.5">
        <div className="flex items-center gap-2.5 text-[15px] font-semibold">
          Summary
          {ready && (
            <Pill tone="success" size="sm">
              Ready
            </Pill>
          )}
        </div>
        <p className={cn("m-0 text-sm leading-[1.55]", ready ? "text-ink-soft" : "text-muted")}>
          {summary ?? "The Narrator agent will write this once every specialist has finished."}
        </p>
      </div>
    </div>
  );
}
