/**
 * Joins class names and drops falsy values:
 *   cn("px-4", isActive && "bg-accent", undefined) → "px-4 bg-accent"
 *
 * Tiny on purpose. If you ever need to merge conflicting Tailwind classes
 * (e.g. "px-2" vs "px-4"), swap this for `clsx` + `tailwind-merge`.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
