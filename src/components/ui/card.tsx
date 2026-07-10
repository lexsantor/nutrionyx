import type { HTMLAttributes } from "react";

// design.md 15.6: surface-1, 1px hairline, radius 12, padding 24.
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-hairline bg-surface-1 p-6 ${className}`}
      {...props}
    />
  );
}
