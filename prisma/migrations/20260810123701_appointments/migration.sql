-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentMode" AS ENUM ('IN_PERSON', 'VIDEO');

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "mode" "AppointmentMode" NOT NULL DEFAULT 'IN_PERSON',
    "videoUrl" TEXT,
    "note" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdByAuthUserId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointments_organizationId_startsAt_idx" ON "appointments"("organizationId", "startsAt");

-- CreateIndex
CREATE INDEX "appointments_organizationId_patientId_startsAt_idx" ON "appointments"("organizationId", "patientId", "startsAt");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
