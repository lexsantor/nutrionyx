import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm transition-all duration-200 hover:shadow-el-md ${className}`}
      {...props}
    />
  );
}
