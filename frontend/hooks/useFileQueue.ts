"use client";

import { useCallback, useMemo, useState } from "react";
import { guessFileKind } from "@/lib/file-kinds";
import type { FileKind } from "@/lib/types";

/** A file waiting to be uploaded, plus our best guess at its kind. */
export interface QueuedFile {
  id: string;
  file: File;
  kind: FileKind;
}

// IDs only need to be unique within this page. crypto.randomUUID() would be
// nicer, but browsers only expose it over HTTPS or on localhost.
let nextId = 0;

/**
 * Holds the files the user has dropped on the New case screen.
 * Adding the same file twice (same name and size) is ignored.
 */
export function useFileQueue() {
  const [items, setItems] = useState<QueuedFile[]>([]);

  const addFiles = useCallback((files: FileList | File[]) => {
    setItems((current) => {
      const seen = new Set(current.map((item) => `${item.file.name}:${item.file.size}`));
      const additions: QueuedFile[] = [];

      for (const file of Array.from(files)) {
        const key = `${file.name}:${file.size}`;
        if (seen.has(key)) continue;
        seen.add(key);
        additions.push({ id: `file-${++nextId}`, file, kind: guessFileKind(file.name) });
      }
      return [...current, ...additions];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const totalBytes = useMemo(() => items.reduce((sum, item) => sum + item.file.size, 0), [items]);

  return { items, addFiles, removeFile, totalBytes };
}
