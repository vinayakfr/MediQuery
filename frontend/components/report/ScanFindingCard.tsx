import { KindBadge } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatScore } from "@/lib/format";
import type { ScanFinding } from "@/lib/types";

/**
 * One imaging result: a preview, the model used and its scores.
 * Flagged labels (the ones a clinician should look at) are drawn in amber.
 */
export function ScanFindingCard({ finding }: { finding: ScanFinding }) {
  return (
    <article
      aria-label={`${finding.fileName} findings`}
      className="flex min-w-0 flex-col overflow-hidden rounded-card border border-card-border bg-card"
    >
      <ScanPreview finding={finding} />

      <div className="flex flex-col gap-3 p-[18px]">
        <div className="flex flex-col gap-0.5 font-mono text-[13px]">
          <span className="truncate">{finding.fileName}</span>
          <span className="text-xs text-accent-text">{finding.model}</span>
        </div>

        {finding.scores.length === 0 ? (
          <p className="m-0 text-sm text-subtle">The model returned no scores for this file.</p>
        ) : (
          finding.scores.map((score) => (
            <div key={score.label} className="flex flex-col gap-[5px]">
              <div className="flex justify-between text-sm">
                <span>{score.label}</span>
                <span className="font-mono">{formatScore(score.score)}</span>
              </div>
              <ProgressBar value={score.score * 100} tone={score.flagged ? "warning" : "accent"} label={`${score.label} score`} />
            </div>
          ))
        )}

        {finding.previewUrl && (
          <a href={finding.previewUrl} target="_blank" rel="noreferrer" className="text-sm font-medium">
            Open full image
          </a>
        )}
      </div>
    </article>
  );
}

/**
 * The scan image with the model's attention map on top, when the backend
 * sends image URLs. Plain <img> is used on purpose: the images come from the
 * local backend, so Next's image optimiser adds nothing here.
 */
function ScanPreview({ finding }: { finding: ScanFinding }) {
  return (
    <div className="relative flex h-[170px] items-center justify-center overflow-hidden bg-[#08090a]">
      {finding.previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={finding.previewUrl} alt={`${finding.fileName} preview`} className="h-full w-full object-contain" />
          {finding.heatmapUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={finding.heatmapUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-60 mix-blend-screen"
            />
          )}
        </>
      ) : (
        <span className="rounded-[10px] border border-dashed border-[#3a3f46] px-3 py-2 text-xs text-subtle">No preview available</span>
      )}
      <KindBadge kind={finding.kind} size="md" className="absolute top-3 left-3" />
    </div>
  );
}
