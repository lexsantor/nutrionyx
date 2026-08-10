-- CreateTable
CREATE TABLE "training_routines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "content" JSONB NOT NULL,
    "updatedByAuthUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "note" TEXT,
    "sessionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_routines_patientId_key" ON "training_routines"("patientId");

-- CreateIndex
CREATE INDEX "training_routines_organizationId_idx" ON "training_routines"("organizationId");

-- CreateIndex
CREATE INDEX "training_sessions_organizationId_patientId_sessionAt_idx" ON "training_sessions"("organizationId", "patientId", "sessionAt");

-- AddForeignKey
ALTER TABLE "training_routines" ADD CONSTRAINT "training_routines_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
