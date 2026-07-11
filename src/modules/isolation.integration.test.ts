import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import {
  createInvitedPatient,
  findPatientByEmail,
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
  });

  afterAll(async () => {
    for (const org of [orgA, orgB]) {
      if (!org) continue;
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
});
