import { Icon, LogoMark } from "@/components/icons/Icon";
import { BackendStatus } from "./BackendStatus";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./NavLink";

/**
 * The left-hand navigation. A server component: only NavLink and
 * BackendStatus need the browser, so the rest renders on the server. Hidden below the md breakpoint.
 */
export function Sidebar() {
  return (
    <nav aria-label="Primary" className="sticky top-0 hidden h-screen w-62 shrink-0 flex-col gap-6 px-4 pt-7 pb-5 md:flex">
      <div className="flex items-center justify-between px-1.5">
        <div className="flex items-center gap-[9px]">
          <LogoMark />
          <span className="font-display text-[22px] font-bold tracking-[-0.01em]">MediQuery</span>
        </div>
        {/* TODO: wire up collapsing once the layout needs it. */}
        {/* <button
          type="button"
          aria-label="Collapse sidebar"
          className="flex size-9 cursor-pointer items-center justify-center rounded-[9px] border border-line bg-transparent text-muted hover:text-ink"
        >
          <Icon name="sidebar" size={16} />
        </button> */}
      </div>

      <WorkspaceSwitcher />

      <div className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>

      <BackendStatus />
    </nav>
  );
}

/** Placeholder for switching between workspaces. Only "Local lab" exists for now. */
function WorkspaceSwitcher() {
  return (
    <button
      type="button"
      className="flex h-13 cursor-pointer items-center gap-2.5 rounded-box border border-[#22252a] bg-card px-3 text-left text-[15px] font-medium text-muted"
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-line text-[13px] font-bold text-ink">L</span>
      <span className="grow text-ink">Local lab</span>
      <Icon name="chevronDown" size={16} />
    </button>
  );
}
