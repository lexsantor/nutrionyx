import { getFormatter, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import {
  listAccessCodes,
  listConsultas,
  platformMetrics,
} from "@/modules/platform-admin/repository";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { CodeGenerator } from "./code-generator";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const role = await resolveUserRole(session.user.id);
  if (role !== "platform-admin") {
    redirect(roleHome(role));
  }

  const t = await getTranslations("admin");
  const format = await getFormatter();
  const [metrics, consultas, codes] = await Promise.all([
    platformMetrics(),
    listConsultas(),
    listAccessCodes(),
  ]);

  return (
    <>
      <Topbar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-sm text-ink-subtle">{t("metrics.consultas")}</p>
            <p className="mt-1 text-2xl font-semibold">{metrics.consultas}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">{t("metrics.patients")}</p>
            <p className="mt-1 text-2xl font-semibold">{metrics.patients}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">{t("metrics.codesUsed")}</p>
            <p className="mt-1 text-2xl font-semibold">{metrics.codesUsed}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">{t("metrics.codesPending")}</p>
            <p className="mt-1 text-2xl font-semibold">{metrics.codesPending}</p>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("consultas.title")}</h2>
          {consultas.length === 0 ? (
            <p className="text-sm text-ink-subtle">{t("consultas.empty")}</p>
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
                    <th scope="col" className="px-4 py-3 font-medium">
                      {t("consultas.patients")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consultas.map((c) => (
                    <tr key={c.id} className="border-b border-hairline transition-colors last:border-0 hover:bg-surface-2">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-ink-subtle">
                        {format.dateTime(c.createdAt, { dateStyle: "medium" })}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{c.patientCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("codes.title")}</h2>
          <p className="text-sm text-ink-subtle">{t("codes.hint")}</p>
          <CodeGenerator
            codes={codes.map((c) => ({
              code: c.code,
              note: c.note,
              used: c.used,
              createdAt: format.dateTime(c.createdAt, { dateStyle: "medium" }),
            }))}
          />
        </section>
      </main>
    </>
  );
}
