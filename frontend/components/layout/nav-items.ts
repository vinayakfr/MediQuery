import type { IconName } from "@/components/icons/Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Sidebar links, top to bottom. "Models" and "Agents" are placeholders for later screens. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "New case", icon: "plus" },
  { href: "/runs", label: "Live runs", icon: "runs" },
  { href: "/reports", label: "Reports", icon: "report" },
  { href: "/models", label: "Models", icon: "models" },
  { href: "/agents", label: "Agents", icon: "agent" },
];
