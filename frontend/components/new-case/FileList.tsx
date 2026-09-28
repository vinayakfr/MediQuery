import { Icon } from "@/components/icons/Icon";
import { KindBadge } from "@/components/ui/Pill";
import type { QueuedFile } from "@/hooks/useFileQueue";
import { formatBytes } from "@/lib/format";

interface Props {
  items: QueuedFile[];
  onRemove: (id: string) => void;
}

/** The files waiting to be uploaded, each with its guessed kind and a remove button. */
export function FileList({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <p className="m-0 rounded-xl bg-raised p-3.5 text-center text-sm text-subtle">No files yet. Add at least one to start.</p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map(({ id, file, kind }) => (
        <li key={id} className="flex min-h-14 items-center gap-3.5 rounded-xl bg-raised py-1.5 pr-2 pl-3">
          <KindBadge kind={kind} className="w-[100px] shrink-0" />

          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="truncate font-mono text-[13px]">{file.name}</span>
            <span className="text-[13px] text-subtle">{formatBytes(file.size)}</span>
          </span>

          <span className="hidden items-center gap-[5px] text-[13px] text-subtle sm:flex">
            <Icon name="check" size={14} strokeWidth={2.4} className="text-success" />
            Auto-detected
          </span>

          <button
            type="button"
            onClick={() => onRemove(id)}
            aria-label={`Remove ${file.name}`}
            className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent text-subtle hover:bg-card hover:text-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
