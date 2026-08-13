"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { passwordStrength } from "@/modules/auth/password-strength";

/**
 * The password field with a meter under it.
 *
 * Four segments rather than one bar: a bar that grows is a percentage, and a
 * percentage invites "how do I get to 100". Four steps read as a scale with a
 * top, and the spring on the fill is the house curve with overshoot
 * (--ease-spring), so a segment lands rather than slides. That is the whole
 * animation budget here: this is a form somebody fills once, not a toy.
 *
 * The meter never blocks. `minLength` on the input is what the browser
 * enforces and the server checks again; the score only tells the user where
 * they are. A meter that rejects passwords it merely dislikes teaches people
 * to write them on a sticky note.
 */
const COLOURS = [
  "bg-error",
  "bg-error",
  "bg-warning",
  "bg-success",
  "bg-success",
] as const;

export function PasswordMeter() {
  const t = useTranslations("auth.password");
  const [value, setValue] = useState("");
  const { score, reason } = passwordStrength(value);
  const hintId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="password" className="text-sm font-medium text-ink">
        {t("label")}
      </label>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder={t("placeholder")}
        aria-describedby={hintId}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div aria-hidden="true" className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3"
          >
            <span
              className={`block h-full origin-left rounded-full transition-transform duration-500 ease-spring ${COLOURS[score]}`}
              style={{
                transform: `scaleX(${value.length > 0 && score > index ? 1 : 0})`,
                transitionDelay: `${index * 60}ms`,
              }}
            />
          </span>
        ))}
      </div>
      {/* role=status, so a screen reader hears the verdict change without the
          field losing focus. Empty until there is something to say. */}
      <p
        id={hintId}
        role="status"
        className={`min-h-[1.25rem] text-xs ${
          score >= 3 ? "text-success" : reason ? "text-warning" : "text-ink-subtle"
        }`}
      >
        {value.length === 0
          ? t("hint")
          : reason
            ? t(`reasons.${reason}`)
            : t(`levels.${score}`)}
      </p>
    </div>
  );
}
