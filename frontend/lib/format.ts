/** Small, dependency-free formatting helpers used across the UI. */

/** 2_400_000 → "2.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}

/** 0.714 → "0.71". Model scores are always shown with two decimals. */
export function formatScore(score: number): string {
  return score.toFixed(2);
}

/** Handles "1 agent" vs "3 agents". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "2026-09-25T20:51:02Z" → "20:51" in the user's local time. Falls back to the raw text. */
export function formatTime(iso: string, withSeconds = false): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: withSeconds ? "2-digit" : undefined, hour12: false });
}
