import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import { getDietPlan } from "@/modules/diet/repository";
import {
  emptyContent,
  normalizeContent,
  type DietPlanContent,
} from "@/modules/diet/plan";
import { listDietTemplates } from "@/modules/diet/templates";
import { DietEditor } from "./diet-editor";
import { getTargets } from "@/modules/targets/repository";

export const metadata = { title: "Plan de dieta" };
export const dynamic = "force-dynamic";

export default async function DietPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tp = await getTranslations("print");
  const t = await getTranslations("diet");

  const { org } = await requireSpecialistOrg();

  const patient = await getPatientDetail(org.id, id);
  if (!patient) {
    notFound();
  }

  const plan = await getDietPlan(org.id, patient.id);
  const targets = await getTargets(org.id, patient.id);
  const templates = await listDietTemplates(org.id);
  const content: DietPlanContent =
    (plan && normalizeContent(plan.content)) || emptyContent();

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/panel/pacientes/${patient.id}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {patient.fullName}
          </Link>
          <h1 className="text-2xl font-semibold">{t("editor.heading")}</h1>
          <p className="text-sm text-ink-subtle">{t("editor.hint")}</p>
          <ButtonLink
            href={`/imprimir/dieta/${patient.id}`}
            size="sm"
            className="w-fit"
          >
            {tp("openDiet")}
          </ButtonLink>
        </div>

        <DietEditor
          patientId={patient.id}
          targets={
            targets
              ? { kcal: targets.kcalTarget, protein: targets.proteinTargetG }
              : null
          }
          initial={{
            title: plan?.title ?? null,
            notes: plan?.notes ?? null,
            content,
          }}
          templates={templates.map((template) => ({
            id: template.id,
            name: template.name,
          }))}
        />
      </div>
    </>
  );
}
