"use client";

import { useTranslations } from "next-intl";
import { NavLink } from "./nav-link";

// Center nav for the specialist console.
export function SpecialistNav() {
  const t = useTranslations("common");
  return (
    <>
      <NavLink href="/panel">{t("navDashboard")}</NavLink>
      <NavLink href="/panel/ajustes">{t("navSettings")}</NavLink>
    </>
  );
}
