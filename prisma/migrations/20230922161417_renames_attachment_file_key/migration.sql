/*
  Warnings:

  - You are about to drop the column `attachementFileKey` on the `ProjectAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `attachementFileKey` on the `TaskUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `attachementName` on the `TaskUpdate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "startDate" SET DATA TYPE TEXT,
ALTER COLUMN "endDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ProjectAttachment" DROP COLUMN "attachementFileKey",
ADD COLUMN     "attachmentFileKey" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ProjectTask" ALTER COLUMN "endDate" SET DATA TYPE TEXT,
ALTER COLUMN "startDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TaskUpdate" DROP COLUMN "attachementFileKey",
DROP COLUMN "attachementName",
ADD COLUMN     "attachmentFileKey" TEXT,
ADD COLUMN     "attachmentName" TEXT;
