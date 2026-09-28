import type { FileKind } from "./types";

/**
 * Display metadata for each file kind.
 * `tone` maps to a colour set defined in app/globals.css (--kind-<tone>-*).
 */
export const FILE_KIND_META: Record<FileKind, { label: string; tone: FileKind }> = {
  xray: { label: "X-ray", tone: "xray" },
  mri: { label: "MRI", tone: "mri" },
  ct: { label: "CT", tone: "ct" },
  prescription: { label: "Prescription", tone: "prescription" },
};

/** File types accepted by the upload dropzone. */
export const ACCEPTED_EXTENSIONS = [".dcm", ".nii", ".nii.gz", ".png", ".jpg", ".jpeg", ".pdf"];

/**
 * A quick client-side guess at a file's kind, based on its name.
 *
 * This only drives the badge the user sees right after dropping a file.
 * The real classification is done by the Extraction agent on the backend,
 * which reads DICOM/NIfTI headers and document content.
 */
export function guessFileKind(fileName: string): FileKind {
  const name = fileName.toLowerCase();

  if (name.endsWith(".pdf") || /rx|prescription|report/.test(name)) return "prescription";
  if (name.endsWith(".nii") || name.endsWith(".nii.gz") || name.includes("mri")) return "mri";
  if (name.includes("ct")) return "ct";
  // DICOM and plain images default to X-ray until the backend says otherwise.
  return "xray";
}
