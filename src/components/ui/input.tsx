import type { InputHTMLAttributes } from "react";
import { DateField } from "./date-field";
import { TimeField } from "./time-field";

// design.md 15.2: h-44, radius 10, surface-2, hairline border, 16px text.
// Focus is handled globally in globals.css (:focus-visible).
//
// `type="date"` and `type="time"` are handed to their own components rather
// than edited into every call site (slice-28), so `<Input type="date">` keeps
// reading the way it always did. A date keeps the native wheel on touch; a
// time is a choice from the consulta's slots, so it is a listbox everywhere.
export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  if (props.type === "date") return <DateField className={className} {...props} />;
  if (props.type === "time") return <TimeField className={className} {...props} />;
  return (
    <input
      className={`block h-11 w-full min-w-0 rounded-[10px] border border-field-border bg-surface-2 px-3.5 text-base text-ink placeholder:text-ink-subtle ${className}`}
      {...props}
    />
  );
}
