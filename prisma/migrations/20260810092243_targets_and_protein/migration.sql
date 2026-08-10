-- AlterEnum
ALTER TYPE "MeasurementKind" ADD VALUE 'PROTEIN';

-- CreateTable
CREATE TABLE "patient_targets" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "kcalTarget" INTEGER,
    "proteinTargetG" INTEGER,
    "sessionsPerWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_targets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_targets_patientId_key" ON "patient_targets"("patientId");

-- CreateIndex
CREATE INDEX "patient_targets_organizationId_idx" ON "patient_targets"("organizationId");

-- AddForeignKey
ALTER TABLE "patient_targets" ADD CONSTRAINT "patient_targets_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
