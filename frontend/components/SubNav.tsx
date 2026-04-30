"use client";

import {
  Search,
  Library,
  User,
  Settings,
  LayoutDashboardIcon,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubNav() {
  const pathname = usePathname();

  return (
    <div className="w-70 shrink-0 h-full flex flex-col gap-6 overflow-y-auto pr-2 panel-scrollbar">
      {/* Profile */}
      <div className="flex items-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-700 to-black overflow-hidden flex items-center justify-center shadow-lg border border-white/10">
          <User size={24} className="text-white/80" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-semibold text-gray-800 text-sm">
            Dr. John Doe
          </div>
          <span className="text-xs text-gray-500">doctor@medical.ai</span>
        </div>
      </div>

      {/* Projects -> Workspaces */}
      <NavSection title="Menu">
        <NavItem
          icon={LayoutDashboardIcon}
          label="Dashboard"
          href="/dashboard"
          active={pathname === "/dashboard"}
        />
        <NavItem
          icon={Library}
          label="Documents"
          href="/documents"
          active={pathname === "/documents"}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          href="/settings"
          active={pathname === "/settings"}
        />
        <NavItem icon={Settings} label="About" href="/about" active={pathname === "/about"} />
      </NavSection>

      {/* Documents */}

      <div className="flex-col items-center h-[50%] overflow-y-auto">
        <h1 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Recent Chats
        </h1>
        <div className="flex items-center glass-panel-dark py-2 px-3 rounded-xl">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-500"
          />
        </div>
      </div>
    </div>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-2 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  href = "#",
  variant = "default",
}: {
  icon?: any;
  label: string;
  active?: boolean;
  href?: string;
  variant?: "default" | "text";
}) {
  const isActive = Boolean(active);

  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
        ${isActive
          ? "bg-white/40 shadow-sm text-gray-800 font-medium"
          : "text-gray-600 hover:bg-white/20 hover:text-gray-800"
        }
      `}
    >
      {Icon && (
        <Icon
          size={18}
          className={isActive ? "text-gray-800" : "text-gray-500"}
        />
      )}

      {!Icon && variant === "default" && <div className="w-4.5" />}

      <span className="flex-1 text-left">{label}</span>
    </Link>
  );
}