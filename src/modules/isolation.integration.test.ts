import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import {
  createInvitedPatient,
  findPatientByEmail,
  getPatientDetail,
  listPatients,
} from "@/modules/patient/repository";
import {
  completeAssessment,
  getOrCreateInProgressAssessment,
  saveAnswer,
} from "@/modules/assessment/repository";
import {
  listWeights,
  recordWeight,
} from "@/modules/measurement/repository";
import { resolveUserRole } from "@/lib/auth/role";
import {
  createAccessCode,
  listConsultas,
  revokeAccessCode,
} from "@/modules/platform-admin/repository";
import {
  getOrgProfile,
  getSpecialtyType,
  isSlugTaken,
  updateOrgProfile,
  updateSpecialtyType,
} from "@/modules/organization/repository";
import {
  hasAcceptedConsent,
  recordConsent,
} from "@/modules/organization/consent";
import { specialistDashboard } from "@/modules/dashboard/specialist";

/**
 * Tenant-isolation invariant - LPEF Prisma Standard R2 (org-scoped queries)
 * and R3 (guarded state transitions). This is the safety core the M2 feedback
 * flagged as untested; the standard's R5 requires exactly this test.
 *
 * It is an integration test: it needs a real Postgres. Set DATABASE_URL and
 * run `npm run test:integration`. Without a database the suite skips, so the
 * plain `npm test` unit run and CI stay green.
 */
const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("tenant isolation", () => {
  const suffix = `iso-${Date.now()}`;
  const bPatientEmail = `b-${suffix}@example.test`;
  let orgA = "";
  let orgB = "";
  let bPatientId = "";
  let bAssessmentId = "";
  let adminUserId = "";

  beforeAll(async () => {
    const a = await prisma.organization.create({
      data: { authOrgId: `authA-${suffix}`, name: "Org A" },
    });
    const b = await prisma.organization.create({
      data: { authOrgId: `authB-${suffix}`, name: "Org B" },
    });
    orgA = a.id;
    orgB = b.id;

    await createInvitedPatient({
      organizationId: orgA,
      email: `a-${suffix}@example.test`,
      fullName: "A Patient",
    });
    const bPatient = await createInvitedPatient({
      organizationId: orgB,
      email: bPatientEmail,
      fullName: "B Patient",
    });
    bPatientId = bPatient.id;
    const bAssessment = await getOrCreateInProgressAssessment({
      organizationId: orgB,
      patientId: bPatient.id,
    });
    bAssessmentId = bAssessment.id;

    adminUserId = `admin-${suffix}`;
    await prisma.platformAdmin.create({ data: { authUserId: adminUserId } });
  });

  afterAll(async () => {
    await prisma.platformAdmin.deleteMany({
      where: { authUserId: adminUserId },
    });
    await prisma.specialistAccessCode.deleteMany({
      where: { createdBy: adminUserId },
    });
    for (const org of [orgA, orgB]) {
      if (!org) continue;
      await prisma.consentRecord.deleteMany({ where: { organizationId: org } });
      await prisma.domainEvent.deleteMany({ where: { organizationId: org } });
      await prisma.measurement.deleteMany({ where: { organizationId: org } });
      await prisma.assessment.deleteMany({ where: { organizationId: org } });
      await prisma.patient.deleteMany({ where: { organizationId: org } });
      await prisma.organization.delete({ where: { id: org } });
    }
    await prisma.$disconnect();
  });

  it("scopes reads: org A never sees org B's patients (R2)", async () => {
    const aPatients = await listPatients(orgA);
    expect(aPatients.every((p) => p.organizationId === orgA)).toBe(true);
    expect(aPatients.some((p) => p.email === bPatientEmail)).toBe(false);
    // Querying B's patient under A's scope resolves to nothing.
    expect(await findPatientByEmail(orgA, bPatientEmail)).toBeNull();
  });

  it("scopes writes: org A cannot mutate org B's assessment (R2, R3)", async () => {
    const result = await saveAnswer({
      assessmentId: bAssessmentId,
      organizationId: orgA, // attacker scope
      field: "conditions",
      value: "cross-tenant-probe",
    });
    expect(result.ok).toBe(false);

    // B's row is untouched: the guard is in the WHERE, not in app code.
    const row = await prisma.assessment.findUniqueOrThrow({
      where: { id: bAssessmentId },
    });
    expect(row.conditions).toBeNull();
  });

  it("blocks cross-tenant completion (R2)", async () => {
    const res = await completeAssessment({
      assessmentId: bAssessmentId,
      organizationId: orgA,
    });
    expect(res.ok).toBe(false);
  });

  it("scopes measurements: org A cannot read org B's weight log (R2)", async () => {
    await recordWeight({
      organizationId: orgB,
      patientId: bPatientId,
      valueKg: 72.4,
    });
    // Under A's scope, B's measurements are invisible.
    expect(await listWeights(orgA, bPatientId)).toEqual([]);
    // Under B's own scope they are present.
    expect((await listWeights(orgB, bPatientId)).length).toBe(1);
  });

  it("scopes patient detail: org A cannot open org B's patient (R2)", async () => {
    // Guessing B's patient id under A's scope resolves to nothing.
    expect(await getPatientDetail(orgA, bPatientId)).toBeNull();
    // Under B's own scope the patient loads.
    const detail = await getPatientDetail(orgB, bPatientId);
    expect(detail?.id).toBe(bPatientId);
  });

  it("resolves the platform-admin role with precedence (adr/0004)", async () => {
    expect(await resolveUserRole(adminUserId)).toBe("platform-admin");
  });

  it("operator-blindness: listConsultas exposes only business fields", async () => {
    const consultas = await listConsultas();
    expect(consultas.length).toBeGreaterThan(0);
    for (const c of consultas) {
      // No clinical columns ever reach the platform admin surface.
      expect(Object.keys(c).sort()).toEqual([
        "createdAt",
        "id",
        "name",
        "patientCount",
      ]);
    }
  });

  it("code generator: mint, revoke-unused, and refuse revoke-used", async () => {
    const code = await createAccessCode({ createdBy: adminUserId, note: "t" });
    expect(await revokeAccessCode(code)).toBe(true);
    expect(await revokeAccessCode(code)).toBe(false); // already removed

    const used = await createAccessCode({ createdBy: adminUserId });
    await prisma.specialistAccessCode.update({
      where: { code: used },
      data: { usedAt: new Date(), usedBy: "someone" },
    });
    expect(await revokeAccessCode(used)).toBe(false); // a used code is never revoked
  });

  it("consulta profile: updating org A leaves org B untouched; slug is unique", async () => {
    await updateOrgProfile(orgA, {
      name: "Org A renamed",
      legalName: "A SL",
      taxId: null,
      addressLine: null,
      locality: null,
      postalCode: null,
      country: "ES",
      hours: null,
      logoUrl: null,
      slug: `slug-a-${suffix}`,
    });
    const bProfile = await getOrgProfile(orgB);
    expect(bProfile?.name).toBe("Org B"); // B's name untouched
    expect(bProfile?.legalName).toBeNull();
    expect(bProfile?.slug).toBeNull();
    // The slug A took is unavailable to B; an unused one is free.
    expect(await isSlugTaken(`slug-a-${suffix}`, orgB)).toBe(true);
    expect(await isSlugTaken(`free-${suffix}`, orgB)).toBe(false);
  });

  it("dashboard counts are org-scoped: A never counts B's patients (R2)", async () => {
    // Seed B with an ACTIVE patient who completed an assessment and never
    // logged weight - a pending-follow-up case.
    const p = await createInvitedPatient({
      organizationId: orgB,
      email: `fu-${suffix}@example.test`,
      fullName: "Follow Up",
    });
    await prisma.patient.update({
      where: { id: p.id },
      data: { status: "ACTIVE" },
    });
    const asmt = await getOrCreateInProgressAssessment({
      organizationId: orgB,
      patientId: p.id,
    });
    await prisma.assessment.update({
      where: { id: asmt.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    const dashA = await specialistDashboard(orgA);
    const dashB = await specialistDashboard(orgB);

    // A's org has none of B's active/completed/pending patients.
    expect(dashA.withCompletedAssessment).toBe(0);
    expect(dashA.pendingFollowUp).toBe(0);
    // B counts its own seeded patient.
    expect(dashB.withCompletedAssessment).toBeGreaterThanOrEqual(1);
    expect(dashB.pendingFollowUp).toBeGreaterThanOrEqual(1);
  });

  it("sub-role and consent are org-scoped (adr/0006)", async () => {
    await updateSpecialtyType(orgA, "SPORTS_NUTRITIONIST");
    await recordConsent({
      organizationId: orgA,
      termsVersion: "test-v1",
      acceptedByAuthUserId: adminUserId,
    });

    // A's sub-role is set; B is untouched (still null).
    expect(await getSpecialtyType(orgA)).toBe("SPORTS_NUTRITIONIST");
    expect(await getSpecialtyType(orgB)).toBeNull();

    // A's consent never counts for B.
    expect(await hasAcceptedConsent(orgA, "DPA", "test-v1")).toBe(true);
    expect(await hasAcceptedConsent(orgB, "DPA", "test-v1")).toBe(false);
  });
});
