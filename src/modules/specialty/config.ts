import type { SpecialtyType } from "@/generated/prisma/client";

/**
 * Role-driven configuration (adr/0006). The specialist sub-role diverges the
 * environment by DATA, not forked code: this map turns `specialtyType` into
 * i18n keys (label, plan terminology) and, later, widget order/templates.
 * Pure and unit-tested. v1 is intentionally thin.
 *
 * `null` (a consulta that has not chosen yet) falls back to the dietitian
 * configuration - the safe, general default - while the UI still prompts the
 * specialist to choose (backfill soft-prompt, adr/0006).
 */
export type SpecialtyConfig = {
  /** i18n key under `specialty.labels.*` for the human name of the sub-role. */
  labelKey: string;
  /** i18n key under `specialty.planTerm.*` for how "plan" is worded. */
  planTermKey: string;
};

const DIETITIAN: SpecialtyConfig = {
  labelKey: "specialty.labels.dietitian",
  planTermKey: "specialty.planTerm.dietitian",
};

const SPORTS: SpecialtyConfig = {
  labelKey: "specialty.labels.sports",
  planTermKey: "specialty.planTerm.sports",
};

export function specialtyConfig(
  type: SpecialtyType | null | undefined,
): SpecialtyConfig {
  return type === "SPORTS_NUTRITIONIST" ? SPORTS : DIETITIAN;
}

/** The two selectable sub-roles, for onboarding/Ajustes pickers. */
export const SPECIALTY_TYPES = [
  "DIETITIAN",
  "SPORTS_NUTRITIONIST",
] as const satisfies readonly SpecialtyType[];
