import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { listPatientsWithLatestAssessment } from "@/modules/patient/repository";
import { latestWeightByPatient } from "@/modules/measurement/repository";
import { unreadFromPatients } from "@/modules/messaging/repository";
import { weightDelta } from "@/modules/measurement/progress";
import { appUrl } from "@/lib/email";
import { InviteForm } from "../invite-form";
import { CancelInvitationButton } from "../cancel-button";
import { CopyLinkButton } from "../copy-link-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const norm = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const t = await getTranslations("panel");
  const { org } = await requireSpecialistOrg();
  const [patients, latestWeights, unreadMessages, { data: pending }] =
    await Promise.all([
      listPatientsWithLatestAssessment(org.id),
      latestWeightByPatient(org.id),
      unreadFromPatients(org.id),
      auth.organization.listInvitations({
        query: { organizationId: org.id },
      }),
    ]);
  const pendingInvitations = (pending ?? []).filter(
    (invitation) => invitation.status === "pending",
  );

  // ponytail: in-memory filter/slice over the full org list; move to SQL
  // when a caseload outgrows a single query.
  const query = norm(q.trim());
  const filtered = query
    ? patients.filter(
        (patient) =>
          norm(patient.fullName ?? "").includes(query) ||
          norm(patient.email ?? "").includes(query),
      )
    : patients;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageN = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const visible = filtered.slice((pageN - 1) * PAGE_SIZE, pageN * PAGE_SIZE);
  const pageHref = (target: number) =>
    `/panel/pacientes?${new URLSearchParams({
      ...(q ? { q } : {}),
      ...(target > 1 ? { page: String(target) } : {}),
    }).toString()}`;

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">{t("patients.title")}</h1>

        {patients.length > 0 ? (
          <form method="get" action="/panel/pacientes" className="flex max-w-sm items-center gap-2">
            <label htmlFor="patient-search" className="sr-only">
              {t("patients.searchLabel")}
            </label>
            <Input
              id="patient-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={t("patients.searchPlaceholder")}
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              {t("patients.search")}
            </Button>
          </form>
        ) : null}

        {patients.length === 0 ? (
          <div className="flex flex-col items-start gap-2 py-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-subtle"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
            <p className="text-base text-ink-subtle">{t("patients.empty")}</p>
            <p className="text-xs text-ink-subtle">{t("patients.emptyHint")}</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-hairline bg-surface-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline bg-surface-2 text-ink-subtle">
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("patients.name")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("patients.email")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("patients.status")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("patients.assessment")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("patients.weight")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((patient) => {
                  const assessment = patient.assessments[0] ?? null;
                  const latest = latestWeights.get(patient.id);
                  const latestKg = latest ? Number(latest.value) : null;
                  const targetKg =
                    assessment?.targetWeightKg != null
                      ? Number(assessment.targetWeightKg)
                      : null;
                  const wDelta =
                    latestKg != null && targetKg != null
                      ? weightDelta(latestKg, targetKg)
                      : null;
                  const fmtKg = (v: number) =>
                    v.toLocaleString("es-ES", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    });
                  return (
                    <tr
                      key={patient.id}
                      className="border-b border-hairline last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <Link
                            href={`/panel/pacientes/${patient.id}`}
                            className="font-medium text-ink no-underline transition-colors hover:text-primary"
                          >
                            {patient.fullName}
                          </Link>
                          {(unreadMessages.get(patient.id) ?? 0) > 0 ? (
                            <span
                              title={t("unreadMessages")}
                              className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-on-primary"
                            >
                              {unreadMessages.get(patient.id)}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-subtle">{patient.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            patient.status === "ACTIVE"
                              ? "inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success"
                              : "inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning"
                          }
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              patient.status === "ACTIVE"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          />
                          {t(`patients.statuses.${patient.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {assessment?.status === "COMPLETED" ? (
                          <span className="text-ink">{t("patients.assessments.completed")}</span>
                        ) : assessment?.status === "IN_PROGRESS" ? (
                          <span className="text-ink-subtle">{t("patients.assessments.inProgress")}</span>
                        ) : (
                          <span className="text-ink-subtle">{t("patients.assessments.pending")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums">
                        {latestKg != null ? (
                          <span>
                            <span className="font-medium">{fmtKg(latestKg)}</span> kg
                            {wDelta != null && wDelta !== 0 ? (
                              <span className="ml-1 text-ink-subtle">
                                {wDelta > 0 ? "↑" : "↓"}
                                {fmtKg(Math.abs(wDelta))}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-ink-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {patients.length > 0 && filtered.length === 0 ? (
          <p className="text-sm text-ink-subtle">
            {t("patients.noResults", { query: q })}
          </p>
        ) : null}

        {totalPages > 1 ? (
          <nav
            aria-label={t("patients.paginationLabel")}
            className="flex items-center gap-3"
          >
            {pageN > 1 ? (
              <ButtonLink href={pageHref(pageN - 1)} variant="ghost" size="sm">
                {t("patients.prevPage")}
              </ButtonLink>
            ) : null}
            <span className="text-sm text-ink-subtle">
              {t("patients.pageOf", { page: pageN, total: totalPages })}
            </span>
            {pageN < totalPages ? (
              <ButtonLink href={pageHref(pageN + 1)} variant="ghost" size="sm">
                {t("patients.nextPage")}
              </ButtonLink>
            ) : null}
          </nav>
        ) : null}

        <InviteForm />

        {pendingInvitations.length > 0 ? (
          <Card>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-semibold">
                  {t("invitations.title")}
                </h2>
                <p className="text-xs text-ink-subtle">
                  {t("invitations.hint")}
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {pendingInvitations.map((invitation) => {
                  const link = `${appUrl()}/auth/accept-invitation?invitationId=${invitation.id}`;
                  return (
                    <li
                      key={invitation.id}
                      className="flex flex-wrap items-center gap-2 border-b border-hairline pb-2 last:border-0 last:pb-0"
                    >
                      <span className="font-medium">{invitation.email}</span>
                      <code className="min-w-0 break-all rounded bg-surface-3 px-2 py-0.5 text-xs">
                        {link}
                      </code>
                      <CopyLinkButton text={link} />
                      <CancelInvitationButton invitationId={invitation.id} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}
