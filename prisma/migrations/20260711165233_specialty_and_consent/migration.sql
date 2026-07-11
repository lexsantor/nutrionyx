-- CreateEnum
CREATE TYPE "SpecialtyType" AS ENUM ('DIETITIAN', 'SPORTS_NUTRITIONIST');

-- CreateEnum
CREATE TYPE "ConsentKind" AS ENUM ('DPA');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "specialtyType" "SpecialtyType";

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" "ConsentKind" NOT NULL DEFAULT 'DPA',
    "termsVersion" TEXT NOT NULL,
    "acceptedByAuthUserId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_records_organizationId_kind_idx" ON "consent_records"("organizationId", "kind");
