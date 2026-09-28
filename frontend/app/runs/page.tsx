import type { Metadata } from "next";
import { LiveRun } from "@/components/run/LiveRun";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Live run · MediQuery" };

/**
 * Route "/runs?case=<caseId>": watch the agents work on a case.
 * The page only reads the case id; <LiveRun /> polls the backend in the browser.
 */
export default async function RunPage({ searchParams }: PageProps<"/runs">) {
  const { case: caseId } = await searchParams;

  if (typeof caseId !== "string" || caseId === "") {
    return (
      <EmptyState
        title="No run selected"
        description="Start a new case and you'll land here to watch the agents work on it."
        action={<ButtonLink href="/">Start a new case</ButtonLink>}
      />
    );
  }

  // key: remount (and restart polling) when switching between cases.
  return <LiveRun key={caseId} caseId={caseId} />;
}
