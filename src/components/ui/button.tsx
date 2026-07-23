import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

// design.md 15.1: pill, 44px, one primary per view. Focus is handled globally
// in globals.css (:focus-visible). One accent fill per view is the caller's
// responsibility.
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.97]",
  secondary:
    "border border-hairline bg-surface-1 text-ink hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.97]",
  ghost: "text-ink hover:bg-surface-3 active:scale-[0.97]",
  destructive: "bg-error text-on-destructive hover:opacity-90 active:scale-[0.97]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
