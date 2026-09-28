import { Icon } from "@/components/icons/Icon";

/** Always-visible reminder that model output is not a diagnosis. */
export function DisclaimerBanner() {
  return (
    <div
      role="note"
      className="flex items-center gap-3 rounded-box border border-warning-border bg-warning-surface px-4 py-3 text-sm"
    >
      <Icon name="warning" className="shrink-0 text-warning-text" />
      <span className="grow text-warning-body">
        <strong className="text-warning-text">Heads up:</strong> this is a research prototype. Model outputs aren&apos;t a
        diagnosis, so run every finding by a clinician.
      </span>
    </div>
  );
}
