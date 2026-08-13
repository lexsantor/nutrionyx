-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('DONE', 'CHANGED', 'SKIPPED');

-- CreateTable
CREATE TABLE "meal_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "status" "MealStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_logs_organizationId_patientId_day_idx" ON "meal_logs"("organizationId", "patientId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "meal_logs_patientId_day_slot_key" ON "meal_logs"("patientId", "day", "slot");

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
