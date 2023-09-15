/*
  Warnings:

  - Added the required column `managedUserId` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectTask" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReopened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managedUserId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "TASK_STATUS" NOT NULL;
