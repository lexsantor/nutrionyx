import { getFormatter, getTranslations } from "next-intl/server";
import { listConsultas } from "@/modules/platform-admin/repository";

export const metadata = { title: "Consultas" };
export const dynamic = "force-dynamic";

/**
 * The consultas on the platform. Business fields only: name, when it was
 * created, how many patients it holds. Operator-blindness (adr/0004) keeps
 * this area out of every clinical table, so there is no drilling into a
 * patient from here and there never should be.
 */
export default async function AdminConsultasPage() {
  const t = await getTranslations("admin");
  const format = await getFormatter();
  const consultas = await listConsultas();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("consultas.title")}</h1>
        <p className="text-base text-ink-subtle">{t("consultas.subtitle")}</p>
      </div>

      {consultas.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-surface-1 p-6 text-sm text-ink-subtle">
          {t("consultas.empty")}
        </p>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-hairline bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-2 text-ink-subtle">
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("consultas.name")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("consultas.created")}
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  {t("consultas.patients")}
                </th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-hairline transition-colors last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-ink-subtle">
                    {format.dateTime(c.createdAt, { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.patientCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-ink-subtle">{t("consultas.blindness")}</p>
    </div>
  );
}
