-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MeasurementKind" ADD VALUE 'CHEST_CM';
ALTER TYPE "MeasurementKind" ADD VALUE 'ARM_CM';
ALTER TYPE "MeasurementKind" ADD VALUE 'THIGH_CM';
ALTER TYPE "MeasurementKind" ADD VALUE 'GLUTE_CM';
ALTER TYPE "MeasurementKind" ADD VALUE 'CALF_CM';
