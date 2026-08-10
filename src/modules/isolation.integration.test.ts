import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import {
  createInvitedPatient,
  erasePatient,
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
import {
  getPlan,
  listDoses,
  logDose,
  upsertPlan,
} from "@/modules/medication/repository";
import { getTargets, upsertTargets } from "@/modules/targets/repository";
import { addNote, listNotes } from "@/modules/notes/repository";
import { addPhoto, listPhotos } from "@/modules/photos/repository";
import {
  addDocument,
  listDocuments,
} from "@/modules/documents/repository";
import { getDietPlan, upsertDietPlan } from "@/modules/diet/repository";
import { emptyContent } from "@/modules/diet/plan";
import {
  getRoutine,
  listSessions,
  logSession,
  upsertRoutine,
} from "@/modules/training/repository";
import { emptyRoutine } from "@/modules/training/routine";
import {
  listMeasurementsSince,
  proteinOnDay,
  recordProtein,
} from "@/modules/measurement/repository";
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
      await prisma.medicationDose.deleteMany({ where: { organizationId: org } });
      await prisma.medicationPlan.deleteMany({ where: { organizationId: org } });
      await prisma.patientTarget.deleteMany({ where: { organizationId: org } });
      await prisma.patientNote.deleteMany({ where: { organizationId: org } });
      await prisma.patientPhoto.deleteMany({ where: { organizationId: org } });
      await prisma.patientDocument.deleteMany({
        where: { organizationId: org },
      });
      await prisma.dietPlan.deleteMany({ where: { organizationId: org } });
      await prisma.trainingSession.deleteMany({
        where: { organizationId: org },
      });
      await prisma.trainingRoutine.deleteMany({
        where: { organizationId: org },
      });
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

  it("scopes medication: org A never sees org B's plan or doses (R2)", async () => {
    await upsertPlan({
      organizationId: orgB,
      patientId: bPatientId,
      drugName: "Wegovy",
      genericName: "semaglutida",
      frequency: "WEEKLY",
      doseMg: 0.25,
      shotDay: 3,
    });
    await logDose({
      organizationId: orgB,
      patientId: bPatientId,
      drugName: "Wegovy",
      doseMg: 0.25,
      site: "LEFT_BELLY",
    });

    // Under A's scope, B's plan and dose log are invisible.
    expect(await getPlan(orgA, bPatientId)).toBeNull();
    expect(await listDoses(orgA, bPatientId)).toEqual([]);
    // Under B's own scope they are present.
    expect((await getPlan(orgB, bPatientId))?.drugName).toBe("Wegovy");
    expect((await listDoses(orgB, bPatientId)).length).toBe(1);
  });

  it("scopes targets and protein: invisible cross-org (R2)", async () => {
    await upsertTargets({
      organizationId: orgB,
      patientId: bPatientId,
      kcalTarget: 2000,
      proteinTargetG: 150,
      sessionsPerWeek: 3,
    });
    await recordProtein({
      organizationId: orgB,
      patientId: bPatientId,
      grams: 42,
    });

    // Under A's scope, B's targets and protein sum are invisible.
    expect(await getTargets(orgA, bPatientId)).toBeNull();
    expect(await proteinOnDay(orgA, bPatientId, new Date())).toBe(0);
    const since = new Date(Date.now() - 86_400_000);
    expect(await listMeasurementsSince(orgA, bPatientId, since)).toEqual([]);
    expect(
      (await listMeasurementsSince(orgB, bPatientId, since)).length,
    ).toBeGreaterThan(0);
    // Under B's own scope they are present.
    expect((await getTargets(orgB, bPatientId))?.proteinTargetG).toBe(150);
    expect(await proteinOnDay(orgB, bPatientId, new Date())).toBe(42);
  });

  it("scopes notes: invisible cross-org (R2)", async () => {
    await addNote({
      organizationId: orgB,
      patientId: bPatientId,
      authorAuthUserId: `spec-${suffix}`,
      body: "nota privada",
    });
    expect(await listNotes(orgA, bPatientId)).toEqual([]);
    expect((await listNotes(orgB, bPatientId)).length).toBe(1);
  });

  it("scopes photos: invisible cross-org (R2)", async () => {
    await addPhoto({
      organizationId: orgB,
      patientId: bPatientId,
      pathname: `photos/${orgB}/${bPatientId}/test.jpg`,
      contentType: "image/jpeg",
    });
    expect(await listPhotos(orgA, bPatientId)).toEqual([]);
    expect((await listPhotos(orgB, bPatientId)).length).toBe(1);
  });

  it("scopes documents: invisible cross-org (R2)", async () => {
    await addDocument({
      organizationId: orgB,
      patientId: bPatientId,
      pathname: `documents/${orgB}/${bPatientId}/informe.pdf`,
      contentType: "application/pdf",
      fileName: "informe.pdf",
      uploadedByAuthUserId: `spec-${suffix}`,
    });
    expect(await listDocuments(orgA, bPatientId)).toEqual([]);
    expect((await listDocuments(orgB, bPatientId)).length).toBe(1);
  });

  it("scopes diet plans: invisible cross-org (R2)", async () => {
    const content = emptyContent();
    content.days[0].BREAKFAST = "Avena";
    await upsertDietPlan({
      organizationId: orgB,
      patientId: bPatientId,
      title: "Plan B",
      notes: null,
      content,
      updatedByAuthUserId: `spec-${suffix}`,
    });
    expect(await getDietPlan(orgA, bPatientId)).toBeNull();
    expect((await getDietPlan(orgB, bPatientId))?.title).toBe("Plan B");
  });

  it("scopes training: routine and sessions invisible cross-org (R2)", async () => {
    const content = emptyRoutine();
    content.days[0] = "Sentadilla 4x8";
    await upsertRoutine({
      organizationId: orgB,
      patientId: bPatientId,
      title: "Fuerza",
      notes: null,
      content,
      updatedByAuthUserId: `spec-${suffix}`,
    });
    const logged = await logSession({
      organizationId: orgB,
      patientId: bPatientId,
      note: null,
    });
    expect(logged).not.toBeNull();
    // A double tap the same day is rejected.
    expect(
      await logSession({
        organizationId: orgB,
        patientId: bPatientId,
        note: null,
      }),
    ).toBeNull();

    expect(await getRoutine(orgA, bPatientId)).toBeNull();
    expect(await listSessions(orgA, bPatientId)).toEqual([]);
    expect((await getRoutine(orgB, bPatientId))?.title).toBe("Fuerza");
    expect((await listSessions(orgB, bPatientId)).length).toBe(1);
  });

  it("erasure: cross-org attempt touches nothing; own-org anonymizes (R2)", async () => {
    const p = await createInvitedPatient({
      organizationId: orgB,
      email: `erase-${suffix}@example.test`,
      fullName: "Erase Me",
    });
    await recordWeight({ organizationId: orgB, patientId: p.id, valueKg: 80 });

    // Under A's scope the erase resolves to nothing and B's data survives.
    expect((await erasePatient(orgA, p.id)).ok).toBe(false);
    expect((await listWeights(orgB, p.id)).length).toBe(1);

    // Under B's own scope: children gone, row anonymized, no PII left.
    expect((await erasePatient(orgB, p.id)).ok).toBe(true);
    expect(await listWeights(orgB, p.id)).toEqual([]);
    const row = await prisma.patient.findUniqueOrThrow({ where: { id: p.id } });
    expect(row.email).toContain("anonimizado.invalid");
    expect(row.fullName).toBeNull();
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
