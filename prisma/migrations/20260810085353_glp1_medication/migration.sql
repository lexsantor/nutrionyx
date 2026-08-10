-- CreateEnum
CREATE TYPE "MedicationFrequency" AS ENUM ('WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "InjectionSite" AS ENUM ('LEFT_ARM', 'RIGHT_ARM', 'LEFT_BELLY', 'RIGHT_BELLY', 'LEFT_THIGH', 'RIGHT_THIGH');

-- CreateTable
CREATE TABLE "medication_plans" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "genericName" TEXT,
    "frequency" "MedicationFrequency" NOT NULL DEFAULT 'WEEKLY',
    "doseMg" DECIMAL(6,2) NOT NULL,
    "shotDay" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_doses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "doseMg" DECIMAL(6,2) NOT NULL,
    "site" "InjectionSite" NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_doses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medication_plans_patientId_key" ON "medication_plans"("patientId");

-- CreateIndex
CREATE INDEX "medication_plans_organizationId_idx" ON "medication_plans"("organizationId");

-- CreateIndex
CREATE INDEX "medication_doses_organizationId_patientId_takenAt_idx" ON "medication_doses"("organizationId", "patientId", "takenAt");

-- AddForeignKey
ALTER TABLE "medication_plans" ADD CONSTRAINT "medication_plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_doses" ADD CONSTRAINT "medication_doses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
