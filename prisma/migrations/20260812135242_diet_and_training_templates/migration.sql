-- CreateTable
CREATE TABLE "diet_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdByAuthUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdByAuthUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diet_templates_organizationId_createdAt_idx" ON "diet_templates"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "diet_templates_organizationId_name_key" ON "diet_templates"("organizationId", "name");

-- CreateIndex
CREATE INDEX "training_templates_organizationId_createdAt_idx" ON "training_templates"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "training_templates_organizationId_name_key" ON "training_templates"("organizationId", "name");
