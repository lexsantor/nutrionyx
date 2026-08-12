import { getTranslations } from "next-intl/server";
import { NavLink } from "@/components/nav-link";

/**
 * Center menu for the patient space (Topbar nav slot). Order follows the
 * rhythm of use: today, then the plan, then how it is going, then the
 * conversation, then the account. The topbar's mobile row scrolls, so the
 * list is not capped at five.
 */
export async function PatientNav() {
  const t = await getTranslations("patientNav");
  return (
    <>
      <NavLink href="/mi-espacio">{t("home")}</NavLink>
      <NavLink href="/mi-espacio/dieta">{t("diet")}</NavLink>
      <NavLink href="/mi-espacio/entreno">{t("training")}</NavLink>
      <NavLink href="/mi-espacio/medicacion">{t("medication")}</NavLink>
      <NavLink href="/mi-espacio/progreso">{t("progress")}</NavLink>
      <NavLink href="/mi-espacio/mensajes">{t("messages")}</NavLink>
      <NavLink href="/mi-espacio/perfil">{t("profile")}</NavLink>
    </>
  );
}
