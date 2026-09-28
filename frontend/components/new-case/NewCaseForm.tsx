"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFileQueue } from "@/hooks/useFileQueue";
import { createCase } from "@/lib/api";
import { formatBytes, pluralize } from "@/lib/format";
import type { PatientDetails } from "@/lib/types";
import { FileDropzone } from "./FileDropzone";
import { FileList } from "./FileList";
import { NextStepsCard } from "./NextStepsCard";
import { PatientDetailsCard } from "./PatientDetailsCard";

const EMPTY_PATIENT: PatientDetails = { nameOrId: "", age: "", sex: "unspecified", notes: "" };

/**
 * The whole New case screen below the header.
 * Owns the form state and hands pieces of it to smaller components.
 */
export function NewCaseForm() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetails>(EMPTY_PATIENT);
  const { items, addFiles, removeFile, totalBytes } = useFileQueue();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { caseId } = await createCase(
        patient,
        items.map((item) => item.file),
      );
      router.push(`/runs?case=${encodeURIComponent(caseId)}`);
    } catch (err) {
      // ApiError messages are already written for people (see lib/api.ts).
      setError(err instanceof Error ? err.message : "Something went wrong while starting the run.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-stretch gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 grow flex-col gap-5">
        <PatientDetailsCard value={patient} onChange={setPatient} />

        <Card
          title="Files"
          action={
            items.length > 0 && (
              <span className="text-sm text-subtle">
                {pluralize(items.length, "file")} · {formatBytes(totalBytes)}
              </span>
            )
          }
        >
          <FileDropzone onFiles={addFiles} />
          <FileList items={items} onRemove={removeFile} />
        </Card>
      </div>

      <aside className="flex shrink-0 flex-col gap-4 xl:w-[350px]">
        <NextStepsCard />

        <Button type="submit" variant="primary" size="lg" trailingIcon="arrowRight" disabled={items.length === 0 || isSubmitting}>
          {isSubmitting ? "Uploading…" : "Let the agents loose"}
        </Button>

        {error && (
          <p role="alert" className="m-0 rounded-xl border border-warning-border bg-warning-surface px-3.5 py-3 text-sm text-warning-text">
            {error}
          </p>
        )}

        <p className="m-0 flex items-start gap-2 text-sm leading-[1.45] text-muted">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          Everything runs on your machine. Nothing gets uploaded anywhere.
        </p>
      </aside>
    </form>
  );
}
