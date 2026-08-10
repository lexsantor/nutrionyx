-- CreateTable
CREATE TABLE "diet_plans" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "content" JSONB NOT NULL,
    "updatedByAuthUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diet_plans_patientId_key" ON "diet_plans"("patientId");

-- CreateIndex
CREATE INDEX "diet_plans_organizationId_idx" ON "diet_plans"("organizationId");

-- AddForeignKey
ALTER TABLE "diet_plans" ADD CONSTRAINT "diet_plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
