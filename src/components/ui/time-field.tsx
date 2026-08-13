import type { InputHTMLAttributes } from "react";
import { Select } from "./select";

/**
 * An appointment time, as a choice from the consulta's slots.
 *
 * Slice-28 decided there is no TimePicker: picking a time here is picking one
 * of a short list, which is the listbox we already own, so a third widget
 * would have been a third keyboard model and a third set of screen-reader
 * semantics for nothing. It also replaces the native clock popup on touch,
 * which is the one place a wheel was not obviously better — two wheels to
 * reach 10:30 is slower than one tap in a list.
 *
 * The cost, stated rather than hidden: a time outside the grid can no longer
 * be typed. Both are opinions about a consulta's day and neither is enforced
 * anywhere else, so widen SLOT_STEP or the range when a real one disagrees.
 */

const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const SLOT_STEP = 15;

function slots(): string[] {
  const out: string[] = [];
  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP) {
      out.push(`${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`);
    }
  }
  return out;
}

const SLOTS = slots();

export function TimeField({
  className = "",
  id,
  name,
  required,
  disabled,
  defaultValue,
  value,
  onChange,
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Select
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      defaultValue={typeof defaultValue === "string" ? defaultValue : undefined}
      value={typeof value === "string" ? value : undefined}
      // The listbox reports through a select's change event, and the value it
      // carries is the same "HH:MM" string the native input submitted, so the
      // server action does not know the difference.
      onChange={
        onChange
          ? (event) =>
              onChange({
                ...event,
                target: event.target as unknown as EventTarget & HTMLInputElement,
              } as unknown as React.ChangeEvent<HTMLInputElement>)
          : undefined
      }
      className={className}
    >
      <option value="">--:--</option>
      {SLOTS.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))}
    </Select>
  );
}
