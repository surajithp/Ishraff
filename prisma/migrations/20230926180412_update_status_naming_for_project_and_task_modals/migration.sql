/*
  Warnings:

  - The values [IN_PROGRESS,COMPLETED,ARCHIVED,OVERDUE] on the enum `PROJECT_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAFT,IN_PROGRESS,IN_REVIEW,COMPLETED,ARCHIVED,REOPENED] on the enum `TASK_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [NOT_STARTED,IN_PROGRESS,COMPLETED,ARCHIVED] on the enum `UPDATE_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PROJECT_STATUS_new" AS ENUM ('in_progress', 'completed', 'draft', 'archived', 'overdue');
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE "PROJECT_STATUS_new" USING ("status"::text::"PROJECT_STATUS_new");
ALTER TYPE "PROJECT_STATUS" RENAME TO "PROJECT_STATUS_old";
ALTER TYPE "PROJECT_STATUS_new" RENAME TO "PROJECT_STATUS";
DROP TYPE "PROJECT_STATUS_old";
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TASK_STATUS_new" AS ENUM ('draft', 'in_progress', 'in_review', 'completed', 'archived', 'overdue');
ALTER TABLE "ProjectTask" ALTER COLUMN "status" TYPE "TASK_STATUS_new" USING ("status"::text::"TASK_STATUS_new");
ALTER TYPE "TASK_STATUS" RENAME TO "TASK_STATUS_old";
ALTER TYPE "TASK_STATUS_new" RENAME TO "TASK_STATUS";
DROP TYPE "TASK_STATUS_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UPDATE_STATUS_new" AS ENUM ('approved', 'in_review', 'flagged');
ALTER TABLE "Update" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskUpdate" ALTER COLUMN "status" TYPE "UPDATE_STATUS_new" USING ("status"::text::"UPDATE_STATUS_new");
ALTER TABLE "Update" ALTER COLUMN "status" TYPE "UPDATE_STATUS_new" USING ("status"::text::"UPDATE_STATUS_new");
ALTER TYPE "UPDATE_STATUS" RENAME TO "UPDATE_STATUS_old";
ALTER TYPE "UPDATE_STATUS_new" RENAME TO "UPDATE_STATUS";
DROP TYPE "UPDATE_STATUS_old";
ALTER TABLE "Update" ALTER COLUMN "status" SET DEFAULT 'in_review';
COMMIT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Update" ALTER COLUMN "status" SET DEFAULT 'in_review';
