"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { NavItem } from "./nav-items";

/**
 * A sidebar link that highlights itself (with the glowing blue bar)
 * when it matches the current route. Client component because it reads the URL.
 */
export function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-12 items-center gap-3 rounded-box border px-[15px] text-base no-underline",
        isActive
          ? "border-line bg-[#1b1e23] font-semibold text-ink hover:text-ink"
          : "border-transparent text-muted hover:bg-card hover:text-ink",
      )}
    >
      <Icon name={icon} size={20} strokeWidth={1.8} />
      {label}
      {isActive && (
        <span aria-hidden="true" className="absolute top-2.5 -right-px bottom-2.5 w-1 rounded-[3px] bg-accent shadow-glow" />
      )}
    </Link>
  );
}
