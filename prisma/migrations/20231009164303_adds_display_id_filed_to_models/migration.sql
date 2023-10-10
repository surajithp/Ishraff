/*
  Warnings:

  - The primary key for the `PlatformInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProjectInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProjectTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TaskUpdate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Update` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UpdateRatings` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ProjectAttachment" DROP CONSTRAINT "ProjectAttachment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectInvitation" DROP CONSTRAINT "ProjectInvitation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTask" DROP CONSTRAINT "ProjectTask_memberId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTask" DROP CONSTRAINT "ProjectTask_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TaskModifications" DROP CONSTRAINT "TaskModifications_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskStatusTransitions" DROP CONSTRAINT "TaskStatusTransitions_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskUpdate" DROP CONSTRAINT "TaskUpdate_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TaskUpdate" DROP CONSTRAINT "TaskUpdate_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Update" DROP CONSTRAINT "Update_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UpdateComments" DROP CONSTRAINT "UpdateComments_memberId_fkey";

-- DropForeignKey
ALTER TABLE "UpdateComments" DROP CONSTRAINT "UpdateComments_taskUpdateId_fkey";

-- DropForeignKey
ALTER TABLE "UpdateRatings" DROP CONSTRAINT "UpdateRatings_memberId_fkey";

-- DropForeignKey
ALTER TABLE "UpdateRatings" DROP CONSTRAINT "UpdateRatings_taskId_fkey";

-- DropForeignKey
ALTER TABLE "UpdateRatings" DROP CONSTRAINT "UpdateRatings_taskUpdateId_fkey";

-- DropIndex
DROP INDEX "Project_displayId_key";

-- AlterTable
ALTER TABLE "PlatformInvitation" DROP CONSTRAINT "PlatformInvitation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlatformInvitation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PlatformInvitation_id_seq";

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Project_id_seq";

-- AlterTable
ALTER TABLE "ProjectAttachment" ADD COLUMN     "displayId" SERIAL NOT NULL,
ALTER COLUMN "projectId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ProjectInvitation" DROP CONSTRAINT "ProjectInvitation_pkey",
ADD COLUMN     "displayId" SERIAL NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProjectInvitation_id_seq";

-- AlterTable
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_pkey",
ADD COLUMN     "displayId" SERIAL NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProjectMember_id_seq";

-- AlterTable
ALTER TABLE "ProjectTask" DROP CONSTRAINT "ProjectTask_pkey",
ADD COLUMN     "displayId" SERIAL NOT NULL,
ALTER COLUMN "managedUserName" SET DEFAULT '',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT,
ALTER COLUMN "memberId" SET DATA TYPE TEXT,
ALTER COLUMN "managedMemberId" SET DEFAULT '',
ALTER COLUMN "managedMemberId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProjectTask_id_seq";

-- AlterTable
ALTER TABLE "TaskModifications" ALTER COLUMN "taskId" SET DATA TYPE TEXT,
ALTER COLUMN "oldMemberId" SET DATA TYPE TEXT,
ALTER COLUMN "newMemberId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TaskStatusTransitions" ALTER COLUMN "taskId" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TaskUpdate" DROP CONSTRAINT "TaskUpdate_pkey",
ADD COLUMN     "displayId" SERIAL NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT,
ALTER COLUMN "taskId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TaskUpdate_id_seq";

-- AlterTable
ALTER TABLE "Update" DROP CONSTRAINT "Update_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Update_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Update_id_seq";

-- AlterTable
ALTER TABLE "UpdateComments" ALTER COLUMN "memberId" SET DATA TYPE TEXT,
ALTER COLUMN "taskUpdateId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UpdateRatings" DROP CONSTRAINT "UpdateRatings_pkey",
ADD COLUMN     "displayId" SERIAL NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "memberId" SET DATA TYPE TEXT,
ALTER COLUMN "taskUpdateId" SET DATA TYPE TEXT,
ALTER COLUMN "taskId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UpdateRatings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UpdateRatings_id_seq";

-- CreateTable
CREATE TABLE "ProjectMemberOnProjects" (
    "projectId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMemberOnProjects_pkey" PRIMARY KEY ("projectId","memberId")
);

-- AddForeignKey
ALTER TABLE "ProjectAttachment" ADD CONSTRAINT "ProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberOnProjects" ADD CONSTRAINT "ProjectMemberOnProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberOnProjects" ADD CONSTRAINT "ProjectMemberOnProjects_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatusTransitions" ADD CONSTRAINT "TaskStatusTransitions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskModifications" ADD CONSTRAINT "TaskModifications_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateComments" ADD CONSTRAINT "UpdateComments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateComments" ADD CONSTRAINT "UpdateComments_taskUpdateId_fkey" FOREIGN KEY ("taskUpdateId") REFERENCES "TaskUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRatings" ADD CONSTRAINT "UpdateRatings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRatings" ADD CONSTRAINT "UpdateRatings_taskUpdateId_fkey" FOREIGN KEY ("taskUpdateId") REFERENCES "TaskUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRatings" ADD CONSTRAINT "UpdateRatings_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
