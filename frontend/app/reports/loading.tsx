import { PageSkeleton } from "@/components/ui/Skeleton";

/** Shown automatically by Next.js while app/reports/page.tsx fetches the report. */
export default function ReportLoading() {
  return <PageSkeleton label="Loading report…" />;
}
