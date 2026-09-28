import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FILE_KIND_META } from "@/lib/file-kinds";
import type { RoutingDecision } from "@/lib/types";

/** Shared cell styles so header and body stay aligned. */
const TH = "border-b border-card-border px-1.5 pb-2 text-left text-[13px] font-semibold text-subtle";
const TD = "border-b border-line-soft px-1.5 py-2.5 align-middle";

/** "Which model got which file": the Orchestrator's decisions and each file's progress. */
export function RoutingTable({ rows }: { rows: RoutingDecision[] }) {
  return (
    <Card title="Which model got which file" className="flex-[1_1_520px]">
      {rows.length === 0 ? (
        <p className="m-0 text-sm text-subtle">The Orchestrator hasn&apos;t routed any files yet.</p>
      ) : (
        <RoutingRows rows={rows} />
      )}
    </Card>
  );
}

function RoutingRows({ rows }: { rows: RoutingDecision[] }) {
  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr>
          <th scope="col" className={`${TH} w-[27%]`}>File</th>
          <th scope="col" className={`${TH} w-[16%]`}>Detected</th>
          <th scope="col" className={`${TH} w-[34%]`}>Model</th>
          <th scope="col" className={`${TH} w-[23%]`}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.fileName}>
            <td className={`${TD} truncate font-mono text-[13px]`}>{row.fileName}</td>
            <td className={`${TD} text-sm text-label`}>{FILE_KIND_META[row.kind].label}</td>
            <td className={TD}>
              <div className="font-mono text-[13px] text-accent-text">{row.model}</div>
              <div className="mt-0.5 text-[13px] text-subtle">{row.reason}</div>
            </td>
            <td className={TD}>
              <div className="mb-1.5 text-[13px] font-medium">{row.status}</div>
              <ProgressBar value={row.progress} height={5} label={`${row.fileName} progress`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
