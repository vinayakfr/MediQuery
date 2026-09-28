import { Icon } from "@/components/icons/Icon";
import { KindBadge } from "@/components/ui/Pill";
import { pluralize } from "@/lib/format";
import type { CaseFile } from "@/lib/types";
import { boxStyle, INPUT_BOX } from "./layout";

/** How many files fit in the box before we show "+N more". */
const MAX_VISIBLE = 5;

/** The first column of the chart: the files the patient uploaded. */
export function InputsNode({ files }: { files: CaseFile[] }) {
  const visible = files.slice(0, MAX_VISIBLE);
  const hidden = files.length - visible.length;

  return (
    <div
      role="group"
      aria-label="Uploaded files"
      style={boxStyle(INPUT_BOX)}
      className="absolute flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-line bg-raised p-3 leading-tight"
    >
      <div className="mb-0.5 flex items-center gap-1.5 text-sm font-semibold">
        <Icon name="upload" size={14} strokeWidth={2.2} className="text-link" />
        {pluralize(files.length, "file")}
      </div>

      {visible.map((file) => (
        <div key={file.id} className="flex flex-col items-start gap-[3px] rounded-[9px] bg-card px-2 py-1.5">
          <KindBadge kind={file.kind} />
          <span className="max-w-full truncate font-mono text-[10px] text-label">{file.name}</span>
        </div>
      ))}

      {hidden > 0 && <span className="text-xs text-subtle">+{hidden} more</span>}
    </div>
  );
}
