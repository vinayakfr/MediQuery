import { cn } from "@/lib/cn";

/** A grey pulsing block shown while data loads. Size it with className (e.g. "h-8 w-64"). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-shimmer rounded-xl bg-raised", className)} />;
}

/** A generic loading layout for a whole screen: header, one tall card, two cards below. */
export function PageSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-[22px]">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-11 w-96 max-w-full" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-card" />
      <div className="flex flex-wrap gap-5">
        <Skeleton className="h-80 min-w-[300px] flex-[1_1_520px] rounded-card" />
        <Skeleton className="h-80 min-w-[300px] flex-[0_1_430px] rounded-card" />
      </div>
    </div>
  );
}
