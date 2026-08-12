import { getFormatter, getTranslations } from "next-intl/server";
import { listAccessCodes } from "@/modules/platform-admin/repository";
import { CodeGenerator } from "../code-generator";

export const metadata = { title: "Códigos de acceso" };
export const dynamic = "force-dynamic";

export default async function AdminCodesPage() {
  const t = await getTranslations("admin");
  const format = await getFormatter();
  const codes = await listAccessCodes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("codes.title")}</h1>
        <p className="text-base text-ink-subtle">{t("codes.hint")}</p>
      </div>
      <CodeGenerator
        codes={codes.map((c) => ({
          code: c.code,
          note: c.note,
          used: c.used,
          createdAt: format.dateTime(c.createdAt, { dateStyle: "medium" }),
        }))}
      />
    </div>
  );
}
