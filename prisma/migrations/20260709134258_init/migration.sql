-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('INVITED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('FEMALE', 'MALE');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "authOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authUserId" TEXT,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "status" "PatientStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "version" INTEGER NOT NULL DEFAULT 1,
    "predecessorId" TEXT,
    "sex" "Sex",
    "birthDate" TIMESTAMP(3),
    "heightCm" DECIMAL(5,1),
    "weightKg" DECIMAL(5,1),
    "targetWeightKg" DECIMAL(5,1),
    "activityLevel" "ActivityLevel",
    "goals" TEXT[],
    "conditions" TEXT,
    "allergies" TEXT,
    "currentMedication" TEXT,
    "bmi" DECIMAL(4,1),
    "targetDeltaRatio" DECIMAL(5,4),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "aggregate" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_authOrgId_key" ON "organizations"("authOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_authUserId_key" ON "patients"("authUserId");

-- CreateIndex
CREATE INDEX "patients_organizationId_idx" ON "patients"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_organizationId_email_key" ON "patients"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_predecessorId_key" ON "assessments"("predecessorId");

-- CreateIndex
CREATE INDEX "assessments_organizationId_idx" ON "assessments"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_patientId_version_key" ON "assessments"("patientId", "version");

-- CreateIndex
CREATE INDEX "domain_events_organizationId_aggregate_aggregateId_idx" ON "domain_events"("organizationId", "aggregate", "aggregateId");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
