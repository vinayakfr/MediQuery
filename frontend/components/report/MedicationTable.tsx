import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { Medication } from "@/lib/types";

/** Shared cell styles so header and body stay aligned. */
const TH = "border-b border-card-border px-1.5 pb-2 text-left text-[13px] font-semibold text-subtle";
const TD = "border-b border-line-soft px-1.5 py-2.5 text-ink-soft";

const COLUMNS = ["Medicine", "Dose", "How often", "How long", "From", "Read quality"];

/** Medicines the Document agent pulled out of the prescriptions. */
export function MedicationTable({ medications }: { medications: Medication[] }) {
  return (
    <Card
      title="Meds we found in the prescriptions"
      action={<span className="text-[13px] text-subtle">From the Document agent</span>}
    >
      {medications.length === 0 ? (
        <p className="m-0 text-sm text-subtle">No medicines were found in the uploaded prescriptions.</p>
      ) : (
        <MedicationRows medications={medications} />
      )}
    </Card>
  );
}

function MedicationRows({ medications }: { medications: Medication[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-[15px]">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className={TH}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {medications.map((med) => (
            <tr key={`${med.name}-${med.sourceFile}`}>
              <td className={`${TD} font-semibold text-ink`}>{med.name}</td>
              <td className={TD}>{med.dose}</td>
              <td className={TD}>{med.frequency}</td>
              <td className={TD}>{med.duration}</td>
              <td className={`${TD} font-mono text-[13px] text-subtle`}>{med.sourceFile}</td>
              <td className={TD}>
                <Pill tone={med.readClearly ? "success" : "warning"} size="sm">
                  {med.readClearly ? "Clear" : "Please check"}
                </Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
