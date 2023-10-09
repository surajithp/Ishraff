/*
  Warnings:

  - Added the required column `managedUserId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reopenedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TASK_STATUS" AS ENUM ('DRAFT', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED', 'REOPENED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReopened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managedUserId" TEXT NOT NULL,
ADD COLUMN     "reopenedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TASK_STATUS" NOT NULL;

-- CreateTable
CREATE TABLE "TASKUPDATE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedOn" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "UPDATE_STATUS" NOT NULL,
    "userId" TEXT NOT NULL,
    "attachmentType" TEXT NOT NULL,
    "attachmentSize" BIGINT NOT NULL,
    "attachementFileKey" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TASKUPDATE_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_managedUserId_fkey" FOREIGN KEY ("managedUserId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TASKUPDATE" ADD CONSTRAINT "TASKUPDATE_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TASKUPDATE" ADD CONSTRAINT "TASKUPDATE_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TASKUPDATE" ADD CONSTRAINT "TASKUPDATE_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
