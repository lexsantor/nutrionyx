"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { markMealAction, type MealLogState } from "./actions";
import type { MealStatus } from "@/generated/prisma/client";

const OPTIONS = ["DONE", "CHANGED", "SKIPPED"] as const;

/**
 * Three buttons under today's meal. Buttons and not a select: the whole point
 * is that a day's check-in stays under a minute, and three taps beat three
 * menus.
 *
 * Each button posts its own value, and the active one posts an empty status,
 * which clears the mark. A patient who taps "saltada" by mistake has a way
 * back that is not "ask your specialist".
 */
export function MealMark({
  slot,
  current,
}: {
  slot: string;
  current: MealStatus | undefined;
}) {
  const t = useTranslations("diet.log");
  const [, formAction, isPending] = useActionState<MealLogState, FormData>(
    markMealAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap gap-1.5">
      <input type="hidden" name="slot" value={slot} />
      {OPTIONS.map((option) => {
        const active = current === option;
        return (
          <button
            key={option}
            type="submit"
            name="status"
            value={active ? "" : option}
            disabled={isPending}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
              active
                ? "border-primary bg-primary text-on-primary"
                : "border-hairline bg-surface-1 text-ink-subtle hover:border-hairline-strong hover:text-ink"
            }`}
          >
            {t(`status.${option}`)}
          </button>
        );
      })}
    </form>
  );
}
