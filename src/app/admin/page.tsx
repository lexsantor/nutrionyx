import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { platformMetrics } from "@/modules/platform-admin/repository";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Administración" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const t = await getTranslations("admin");
  const metrics = await platformMetrics();

  const tiles = [
    { key: "consultas", value: metrics.consultas },
    { key: "patients", value: metrics.patients },
    { key: "codesUsed", value: metrics.codesUsed },
    { key: "codesPending", value: metrics.codesPending },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-base text-ink-subtle">{t("overview.subtitle")}</p>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.key}>
            <p className="text-sm text-ink-subtle">{t(`metrics.${tile.key}`)}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {tile.value}
            </p>
          </Card>
        ))}
      </section>

      <p className="text-sm text-ink-subtle">
        {t.rich("overview.hint", {
          consultas: (chunks) => (
            <Link href="/admin/consultas" className="text-accent-text">
              {chunks}
            </Link>
          ),
          auditoria: (chunks) => (
            <Link href="/admin/auditoria" className="text-accent-text">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
