import type { Metadata } from "next";
import { AgentTrail } from "@/components/report/AgentTrail";
import { DisclaimerBanner } from "@/components/report/DisclaimerBanner";
import { MedicationTable } from "@/components/report/MedicationTable";
import { ScanFindingCard } from "@/components/report/ScanFindingCard";
import { SummaryCard } from "@/components/report/SummaryCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, getReport } from "@/lib/api";
import { formatTime, pluralize } from "@/lib/format";
import type { CaseReport } from "@/lib/types";

export const metadata: Metadata = { title: "Report · MediQuery" };

/**
 * Route "/reports?case=<caseId>": the finished, combined patient report.
 * A server component: the report is fetched on the server, so the page
 * ships no JavaScript of its own. app/reports/loading.tsx shows while it loads.
 */
export default async function ReportPage({ searchParams }: PageProps<"/reports">) {
  const { case: caseId } = await searchParams;

  if (typeof caseId !== "string" || caseId === "") {
    return (
      <EmptyState
        icon="report"
        title="No report selected"
        description="Reports appear here once the agents finish a case."
        action={<ButtonLink href="/">Start a new case</ButtonLink>}
      />
    );
  }

  let report: CaseReport;
  try {
    report = await getReport(caseId);
  } catch (error) {
    return <ReportError caseId={caseId} error={error} />;
  }

  return <Report report={report} />;
}

/** The report itself, once we have the data. */
function Report({ report }: { report: CaseReport }) {
  const runHref = `/runs?case=${encodeURIComponent(report.caseId)}`;

  return (
    <>
      <PageHeader
        eyebrow={`Case ${report.caseId}`}
        title="Here's the full picture"
        description={[
          report.patientName,
          pluralize(report.fileCount, "file"),
          pluralize(report.modelCount, "model"),
          pluralize(report.agentCount, "agent"),
          `done at ${formatTime(report.finishedAt)}`,
        ].join(" · ")}
        actions={
          <>
            <ButtonLink href={runHref} variant="secondary">
              View the run
            </ButtonLink>
            {/* TODO: generate the PDF on the backend (GET /cases/:id/report.pdf) and link to it here. */}
            <Button variant="primary" icon="download" disabled title="Coming soon">
              Export PDF
            </Button>
          </>
        }
      />

      <DisclaimerBanner />

      <div className="flex flex-wrap items-stretch gap-5">
        <SummaryCard summary={report.summary} flags={report.flags} />
        <AgentTrail trail={report.trail} />
      </div>

      {report.scans.length > 0 && (
        <section aria-label="Imaging findings" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
          {report.scans.map((finding) => (
            <ScanFindingCard key={finding.fileName} finding={finding} />
          ))}
        </section>
      )}

      <MedicationTable medications={report.medications} />
    </>
  );
}

/** Friendly messages for the ways fetching a report can fail. */
function ReportError({ caseId, error }: { caseId: string; error: unknown }) {
  const status = error instanceof ApiError ? error.status : 0;
  const runHref = `/runs?case=${encodeURIComponent(caseId)}`;

  if (status === 409) {
    return (
      <EmptyState
        icon="runs"
        title="The report isn't ready yet"
        description="The agents are still working on this case. You can watch them on the live run."
        action={<ButtonLink href={runHref}>Watch the run</ButtonLink>}
      />
    );
  }

  return (
    <EmptyState
      tone="error"
      title={status === 404 ? "We couldn't find that case" : "Couldn't load the report"}
      description={error instanceof Error ? error.message : undefined}
      action={
        <>
          <ButtonLink href={`/reports?case=${encodeURIComponent(caseId)}`} variant="secondary">
            Try again
          </ButtonLink>
          <ButtonLink href="/">Start a new case</ButtonLink>
        </>
      }
    />
  );
}
