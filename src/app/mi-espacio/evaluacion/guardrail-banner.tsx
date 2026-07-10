"use client";

import { useTranslations } from "next-intl";
import { lossTier, targetDeltaRatio } from "@/modules/assessment/computed";

const TIER_STYLES = {
  info: "bg-surface-2 text-info",
  healthy: "bg-success-soft text-success",
  aggressive: "bg-warning-soft text-warning",
} as const;

/**
 * Live capture-time guardrail (build plan step 5): tiered feedback on
 * the target weight ratio, computed client-side with the same pure
 * functions the server persists at completion.
 */
export function GuardrailBanner({
  currentWeightKg,
  targetValue,
}: {
  currentWeightKg: number;
  targetValue: string;
}) {
  const t = useTranslations("wizard.guardrail");

  const target = Number(targetValue.replace(",", "."));
  if (!Number.isFinite(target) || target <= 0 || currentWeightKg <= 0) {
    return null;
  }

  const ratio = targetDeltaRatio(currentWeightKg, target);
  const tier = lossTier(ratio);
  const percent = Math.round(Math.abs(ratio) * 100);

  return (
    <p
      role="status"
      className={`rounded-[10px] px-3 py-2 text-sm ${TIER_STYLES[tier]}`}
    >
      {t(tier, { percent })}
    </p>
  );
}
