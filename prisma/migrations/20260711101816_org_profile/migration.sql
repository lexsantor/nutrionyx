/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'ES',
ADD COLUMN     "hours" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "taxId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
