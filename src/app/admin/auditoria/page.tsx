import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import {
  EVENTS_PAGE_SIZE,
  listConsultas,
  listEventTypes,
  listPlatformEvents,
} from "@/modules/platform-admin/repository";

export const metadata = { title: "Auditoría" };
export const dynamic = "force-dynamic";

const RANGES = ["24h", "7d", "30d", "all"] as const;
type Range = (typeof RANGES)[number];

const SINCE: Record<Range, number | null> = {
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  all: null,
};

/**
 * The append-only trail, readable for the first time
 * (docs/build/navigation-audit.md, tier 3). Every slice has written to
 * DomainEvent since the first one and nothing had ever read it back.
 *
 * Payloads are not shown, and the repository does not even select them:
 * several carry clinical values (a BMI, a measured perimeter, a drug name
 * and dose), and operator-blindness (adr/0004) keeps this area away from
 * exactly that. What an audit trail owes its reader is who touched what and
 * when, which is what the columns are.
 */
export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    org?: string;
    tipo?: string;
    rango?: string;
    page?: string;
  }>;
}) {
  const { org = "", tipo = "", rango = "7d", page = "1" } = await searchParams;
  const t = await getTranslations("admin");
  const format = await getFormatter();

  const range: Range = (RANGES as readonly string[]).includes(rango)
    ? (rango as Range)
    : "7d";
  const window = SINCE[range];
  const pageN = Math.max(1, Number(page) || 1);

  // The cutoff is computed once, before the reads, so the three queries
  // share one instant. (react-hooks/purity rejects Date.now() in render.)
  const now = new Date();
  const since = window ? new Date(now.getTime() - window) : undefined;

  const [consultas, types, { rows, total }] = await Promise.all([
    listConsultas(),
    listEventTypes(),
    listPlatformEvents({
      organizationId: org || undefined,
      type: tipo || undefined,
      since,
      page: pageN,
    }),
  ]);

  const nameOf = new Map(consultas.map((c) => [c.id, c.name]));
  const totalPages = Math.max(1, Math.ceil(total / EVENTS_PAGE_SIZE));
  const pageHref = (target: number) =>
    `/admin/auditoria?${new URLSearchParams({
      ...(org ? { org } : {}),
      ...(tipo ? { tipo } : {}),
      ...(range !== "7d" ? { rango: range } : {}),
      ...(target > 1 ? { page: String(target) } : {}),
    }).toString()}`;

  const field =
    "h-9 rounded-full border border-field-border bg-surface-1 px-3 text-sm text-ink";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("audit.title")}</h1>
        <p className="text-base text-ink-subtle">{t("audit.subtitle")}</p>
      </div>

      {/* A GET form: every filter state is a URL, so an auditor can keep or
          share the exact view they were looking at. */}
      <form
        method="get"
        action="/admin/auditoria"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface-2 p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="org" className="text-xs font-medium">
            {t("audit.consulta")}
          </label>
          <select id="org" name="org" defaultValue={org} className={field}>
            <option value="">{t("audit.allConsultas")}</option>
            {consultas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tipo" className="text-xs font-medium">
            {t("audit.type")}
          </label>
          <select id="tipo" name="tipo" defaultValue={tipo} className={field}>
            <option value="">{t("audit.allTypes")}</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="rango" className="text-xs font-medium">
            {t("audit.range")}
          </label>
          <select id="rango" name="rango" defaultValue={range} className={field}>
            {RANGES.map((r) => (
              <option key={r} value={r}>
                {t(`audit.ranges.${r}`)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition-[transform,background-color] hover:bg-primary-hover active:scale-[0.98] active:duration-150"
        >
          {t("audit.apply")}
        </button>
      </form>

      <p className="text-sm text-ink-subtle">
        {t("audit.count", { total })}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-surface-1 p-6 text-sm text-ink-subtle">
          {t("audit.empty")}
        </p>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-hairline bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-2 text-ink-subtle">
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("audit.when")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("audit.consulta")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("audit.type")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("audit.subject")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-ink-subtle">
                    {format.dateTime(row.createdAt, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {nameOf.get(row.organizationId) ?? (
                      <span className="text-ink-subtle">
                        {t("audit.deletedConsulta")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.type}</td>
                  <td className="px-4 py-3 text-ink-subtle">
                    {row.aggregate}
                    <span className="ml-1.5 font-mono text-xs">
                      {row.aggregateId.slice(-8)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label={t("audit.pagination")}
          className="flex items-center gap-3 text-sm"
        >
          {pageN > 1 ? (
            <Link href={pageHref(pageN - 1)} className="text-accent-text">
              {t("audit.previous")}
            </Link>
          ) : null}
          <span className="text-ink-subtle">
            {t("audit.page", { page: pageN, total: totalPages })}
          </span>
          {pageN < totalPages ? (
            <Link href={pageHref(pageN + 1)} className="text-accent-text">
              {t("audit.next")}
            </Link>
          ) : null}
        </nav>
      ) : null}

      <p className="text-xs text-ink-subtle">{t("audit.blindness")}</p>
    </div>
  );
}
