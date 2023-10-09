/*
  Warnings:

  - Changed the type of `projectId` on the `TaskStatusTransitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TaskStatusTransitions" DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;
