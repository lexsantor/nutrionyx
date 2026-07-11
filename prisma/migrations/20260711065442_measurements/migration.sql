-- CreateEnum
CREATE TYPE "MeasurementKind" AS ENUM ('WEIGHT');

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "kind" "MeasurementKind" NOT NULL DEFAULT 'WEIGHT',
    "value" DECIMAL(5,1) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "measurements_organizationId_patientId_recordedAt_idx" ON "measurements"("organizationId", "patientId", "recordedAt");

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
