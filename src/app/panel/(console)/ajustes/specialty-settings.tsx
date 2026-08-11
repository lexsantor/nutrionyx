"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateSpecialtyAction } from "./actions";
import type { SpecialtyType } from "@/generated/prisma/client";

const SPECIALTIES = [
  { value: "DIETITIAN", key: "dietitian" },
  { value: "SPORTS_NUTRITIONIST", key: "sports" },
] as const;

export function SpecialtySettings({
  current,
}: {
  current: SpecialtyType | null;
}) {
  const t = useTranslations("settings.specialty");
  const tc = useTranslations("org.create.specialty");
  const [state, formAction, isPending] = useActionState(
    updateSpecialtyAction,
    null,
  );
  const selected = current ?? "DIETITIAN";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-ink-subtle">{t("hint")}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        {SPECIALTIES.map((s) => (
          <label
            key={s.value}
            className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-hairline p-3 transition-colors hover:border-hairline-strong has-[:checked]:border-primary has-[:checked]:bg-primary-subtle"
          >
            <input
              type="radio"
              name="specialtyType"
              value={s.value}
              defaultChecked={s.value === selected}
              className="mt-1"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">
                {tc(`${s.key}.label`)}
              </span>
              <span className="text-xs text-ink-subtle">
                {tc(`${s.key}.hint`)}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {state && "ok" in state ? (
        <p role="status" className="text-sm text-success">
          {t("saved")}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
