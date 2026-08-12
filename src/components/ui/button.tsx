import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

// design.md 15.1: pill, 44px, one primary per view. Focus is handled globally
// in globals.css (:focus-visible). One accent fill per view is the caller's
// responsibility.
//
// Width is a prop, not a class the caller adds: `w-auto` in className does
// not beat `w-full` in the base, because Tailwind emits w-auto first and
// equal specificity is settled by stylesheet order, not attribute order.
// The component picks one width utility so the two never meet.
//
// "block" is the default: on a phone a form's action is the only thing on
// its line, and a 90px pill at the left of a 356px card is both harder to
// hit and weaker as an ending. From sm up it shrinks to its label again.
// "auto" is for a button that sits beside a field rather than under it.
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.97]",
  secondary:
    "border border-hairline bg-surface-1 text-ink hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.97]",
  ghost: "text-ink hover:bg-surface-3 active:scale-[0.97]",
  destructive: "bg-error text-on-destructive hover:bg-error-hover active:scale-[0.97]",
};

const WIDTHS = {
  block: "w-full sm:w-auto",
  auto: "w-auto",
} as const;

export function Button({
  variant = "primary",
  width = "block",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  width?: keyof typeof WIDTHS;
}) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 ${WIDTHS[width]} text-sm font-semibold transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-house active:duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
