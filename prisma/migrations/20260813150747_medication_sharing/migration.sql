-- AlterTable
ALTER TABLE "medication_plans" ADD COLUMN     "sharedWithSpecialist" BOOLEAN NOT NULL DEFAULT false;

-- Plans that already existed keep the visibility they had (owner decision
-- 2026-08-13). The consulta is the data controller and already holds that
-- clinical history, so switching it off retroactively would leave a hole in a
-- record it answers for, without unseeing anything the specialist already
-- read. The patient sees the toggle on and can turn it off.
--
-- New plans default to false, which is the point of the change.
UPDATE "medication_plans" SET "sharedWithSpecialist" = true;
