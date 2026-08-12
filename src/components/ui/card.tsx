import type { HTMLAttributes } from "react";

// Static panel: motion must not fake affordance. Cards that are actually
// links carry their own lift at the call site.
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm ${className}`}
      {...props}
    />
  );
}
