-- CreateTable
CREATE TABLE "patient_photos" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_photos_organizationId_patientId_createdAt_idx" ON "patient_photos"("organizationId", "patientId", "createdAt");

-- AddForeignKey
ALTER TABLE "patient_photos" ADD CONSTRAINT "patient_photos_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
