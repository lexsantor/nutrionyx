import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "lg" | "md" | "sm";

// Site-wide rule: the primary action is a filled pill, the secondary is an
// OUTLINED pill - never an underlined text link. Ghost is for tertiary,
// low-emphasis actions (still a pill hit-area, still no underline).
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-el-sm hover:bg-primary-hover hover:shadow-el-md",
  secondary:
    "border border-hairline bg-surface-1 text-ink shadow-el-sm hover:border-hairline-strong hover:bg-surface-2 hover:shadow-el-md",
  ghost: "text-ink-subtle hover:bg-surface-3 hover:text-ink",
};

const SIZES: Record<Size, string> = {
  lg: "h-[52px] px-7 text-sm",
  md: "h-11 px-6 text-sm",
  sm: "h-9 px-4 text-sm",
};

export function ButtonLink({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold no-underline transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-house active:scale-[0.98] active:duration-150 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
