import { prisma } from "@/lib/prisma";
import {
  CUSTOM_ANSWER_MAX,
  CUSTOM_PROMPT_MAX,
  MAX_CUSTOM_QUESTIONS,
} from "./definition";

/**
 * A consulta's own assessment questions (roadmap 2026-08-14).
 *
 * Deliberately small: free text, always optional, behind the fixed ten and
 * never interleaved. A whole question builder was rejected as
 * disproportionate for a product with one consulta, and an optional text box
 * covers what a specialist actually asks that the fixed wizard does not.
 *
 * Org-scoped like every repository here (LPEF Prisma R2/R4): organizationId
 * comes from the caller's session, never from the request.
 */

export type CustomQuestion = { id: string; prompt: string };

/** Active questions in the order the specialist put them. */
export async function listQuestions(
  organizationId: string,
): Promise<CustomQuestion[]> {
  const rows = await prisma.assessmentQuestion.findMany({
    where: { organizationId, active: true },
    orderBy: { position: "asc" },
    select: { id: true, prompt: true },
  });
  return rows;
}

export type AddQuestionResult =
  | { ok: true }
  | { ok: false; errorKey: "empty" | "tooLong" | "full" };

/**
 * Add one. The prompt is write-once by design: editing it would silently
 * re-label every answer already given under the old wording, the same reason
 * MedicationDose snapshots its drug and dose.
 */
export async function addQuestion(params: {
  organizationId: string;
  prompt: string;
  authUserId: string;
}): Promise<AddQuestionResult> {
  const prompt = params.prompt.trim();
  if (!prompt) return { ok: false, errorKey: "empty" };
  if (prompt.length > CUSTOM_PROMPT_MAX) return { ok: false, errorKey: "tooLong" };

  // One read answers both questions: how many are live, and the highest
  // position in use.
  const live = await prisma.assessmentQuestion.findMany({
    where: { organizationId: params.organizationId, active: true },
    select: { position: true },
    orderBy: { position: "desc" },
  });
  if (live.length >= MAX_CUSTOM_QUESTIONS) return { ok: false, errorKey: "full" };

  await prisma.assessmentQuestion.create({
    data: {
      organizationId: params.organizationId,
      prompt,
      // Past the highest live position, not the count: a deactivated question
      // keeps its number, so counting would collide with it.
      position: (live[0]?.position ?? -1) + 1,
      createdByAuthUserId: params.authUserId,
    },
  });
  return { ok: true };
}

/**
 * Retire a question. Deactivates rather than deletes, so the answers already
 * given stay attached to the assessments they belong to - a clinical record
 * does not lose an answer because the question stopped being asked.
 */
export async function deactivateQuestion(params: {
  organizationId: string;
  questionId: string;
}): Promise<void> {
  await prisma.assessmentQuestion.updateMany({
    where: { id: params.questionId, organizationId: params.organizationId },
    data: { active: false },
  });
}

/** Answers for one assessment, keyed by question id. */
export async function answersFor(
  organizationId: string,
  assessmentId: string,
): Promise<Map<string, string>> {
  const rows = await prisma.assessmentQuestionAnswer.findMany({
    where: { organizationId, assessmentId },
    select: { questionId: true, value: true },
  });
  return new Map(rows.map((row) => [row.questionId, row.value]));
}

/**
 * Save (or clear) one answer. Empty clears it, because a patient who typed
 * something and thought better of it needs a way back that is not support.
 *
 * Guarded on the question belonging to the caller's org: the id arrives from
 * a form post and is not to be trusted on its own.
 */
export async function saveAnswer(params: {
  organizationId: string;
  assessmentId: string;
  questionId: string;
  value: string;
}): Promise<void> {
  const question = await prisma.assessmentQuestion.findFirst({
    where: {
      id: params.questionId,
      organizationId: params.organizationId,
      active: true,
    },
    select: { id: true },
  });
  if (!question) return;

  const value = params.value.trim().slice(0, CUSTOM_ANSWER_MAX);
  if (!value) {
    await prisma.assessmentQuestionAnswer.deleteMany({
      where: {
        organizationId: params.organizationId,
        assessmentId: params.assessmentId,
        questionId: params.questionId,
      },
    });
    return;
  }

  await prisma.assessmentQuestionAnswer.upsert({
    where: {
      assessmentId_questionId: {
        assessmentId: params.assessmentId,
        questionId: params.questionId,
      },
    },
    create: {
      organizationId: params.organizationId,
      assessmentId: params.assessmentId,
      questionId: params.questionId,
      value,
    },
    update: { value },
  });
}

/**
 * Prompt and answer together, for the specialist's record and the review
 * screen. Includes retired questions that were answered, because the answer
 * is part of the record even when the question is no longer asked.
 */
export async function answeredQuestionsFor(
  organizationId: string,
  assessmentId: string,
): Promise<{ prompt: string; value: string }[]> {
  const rows = await prisma.assessmentQuestionAnswer.findMany({
    where: { organizationId, assessmentId },
    orderBy: { question: { position: "asc" } },
    select: { value: true, question: { select: { prompt: true } } },
  });
  return rows.map((row) => ({ prompt: row.question.prompt, value: row.value }));
}
