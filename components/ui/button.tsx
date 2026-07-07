import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseClasses =
  "inline-flex shrink-0 items-center justify-center gap-2 text-center font-semibold leading-none outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:shrink-0 [&_svg]:self-center";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-button-primary-bg text-button-primary-text shadow-[0_8px_22px_var(--shadow-soft)] hover:bg-button-primary-bg-hover",
  secondary:
    "border border-button-secondary-border bg-button-secondary-bg text-button-secondary-text shadow-[inset_0_1px_0_var(--fg-7)] hover:bg-button-secondary-bg-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 rounded-lg px-3 py-1.5 text-xs",
  md: "min-h-10 rounded-xl px-4 py-2.5 text-sm",
  lg: "min-h-12 rounded-2xl px-5 py-3 text-sm",
  icon: "size-9 rounded-xl p-0",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function AppButton({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClassName({ variant, size, className })}
    />
  );
}

type AppButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function AppButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: AppButtonLinkProps) {
  return (
    <Link
      {...props}
      className={buttonClassName({ variant, size, className })}
    />
  );
}
