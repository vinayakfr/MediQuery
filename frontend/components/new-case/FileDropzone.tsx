"use client";

import { useState, type DragEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ACCEPTED_EXTENSIONS } from "@/lib/file-kinds";

interface Props {
  onFiles: (files: FileList) => void;
}

/**
 * Drag-and-drop area. It is a <label> wrapping a hidden file input, so a click
 * or Enter/Space on the focused input also opens the file picker.
 */
export function FileDropzone({ onFiles }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) onFiles(event.dataTransfer.files);
  };

  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center gap-[18px] rounded-2xl border-[1.5px] border-dashed px-[22px] py-5 transition-colors",
        "hover:border-accent hover:bg-accent-deep focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
        isDragging ? "border-accent bg-accent-deep" : "border-[#34507f] bg-[#121a28]",
      )}
      onDragOver={(event) => {
        event.preventDefault(); // required, or the browser opens the file instead
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <span className="flex size-[50px] shrink-0 items-center justify-center rounded-box bg-accent-chip text-accent-text">
        <Icon name="upload" size={24} />
      </span>

      <span className="flex flex-col gap-1">
        <span className="text-[17px] font-semibold">Drag it all in here: scans, X-rays, prescriptions</span>
        <span className="text-sm text-muted">
          DICOM, NIfTI, PNG, JPG or PDF · or <span className="text-link underline">browse files</span>
        </span>
      </span>

      <input
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) onFiles(event.target.files);
          event.target.value = ""; // let the same file be picked again after removing it
        }}
      />
    </label>
  );
}
