-- CreateTable
CREATE TABLE "assessment_questions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdByAuthUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_question_answers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_questions_organizationId_active_position_idx" ON "assessment_questions"("organizationId", "active", "position");

-- CreateIndex
CREATE INDEX "assessment_question_answers_organizationId_assessmentId_idx" ON "assessment_question_answers"("organizationId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_question_answers_assessmentId_questionId_key" ON "assessment_question_answers"("assessmentId", "questionId");

-- AddForeignKey
ALTER TABLE "assessment_question_answers" ADD CONSTRAINT "assessment_question_answers_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_question_answers" ADD CONSTRAINT "assessment_question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "assessment_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
