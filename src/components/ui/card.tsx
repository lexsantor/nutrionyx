import type { HTMLAttributes } from "react";

// Static panel by default (no hover: motion must not fake affordance).
// `interactive` opts into the house lift for cards that are actually links
// or wrap a primary action.
export function Card({
  className = "",
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  const motion = interactive
    ? " transition-[transform,box-shadow,border-color] duration-500 ease-house hover:-translate-y-0.5 hover:shadow-el-md"
    : "";
  return (
    <div
      className={`rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm${motion} ${className}`}
      {...props}
    />
  );
}
