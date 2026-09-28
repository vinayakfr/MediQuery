import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface SharedProps {
  variant?: Variant;
  size?: Size;
  /** Icon shown before the label. */
  icon?: IconName;
  /** Icon shown after the label (e.g. an arrow on "next" actions). */
  trailingIcon?: IconName;
  children?: ReactNode;
}

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold no-underline transition-colors " +
  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "border-0 bg-accent-strong text-white hover:bg-accent-hover hover:text-white disabled:hover:bg-accent-strong",
  secondary: "border border-input bg-card font-medium text-ink hover:bg-raised hover:text-ink",
  ghost: "border-0 bg-transparent text-subtle hover:bg-raised hover:text-ink",
};

const SIZES: Record<Size, string> = {
  md: "h-[46px] rounded-xl px-[18px] text-[15px]",
  lg: "h-[58px] rounded-2xl px-6 text-[17px]",
};

/** Class list for a button. Exported so other components can style links the same way. */
export function buttonClasses(variant: Variant = "secondary", size: Size = "md", extra?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], variant === "primary" && size === "lg" && "shadow-cta", extra);
}

function Content({ icon, trailingIcon, children }: SharedProps) {
  return (
    <>
      {icon && <Icon name={icon} size={16} strokeWidth={2.2} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16} strokeWidth={2.2} />}
    </>
  );
}

/** A real <button>. Use for actions that stay on the page. */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...rest
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      <Content icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </button>
  );
}

/** A Next.js <Link> styled as a button. Use for navigation. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  className,
  children,
  ...rest
}: SharedProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      <Content icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </Link>
  );
}
