import type { InputHTMLAttributes } from "react";

// design.md 15.2: h-44, radius 10, surface-2, hairline border, 16px text.
// Focus is handled globally in globals.css (:focus-visible).
export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`block h-11 w-full rounded-[10px] border border-hairline bg-surface-2 px-3.5 text-base text-ink placeholder:text-ink-tertiary ${className}`}
      {...props}
    />
  );
}
