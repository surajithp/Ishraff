/*
  Warnings:

  - The primary key for the `PlatformInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PlatformInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProjectInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProjectInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProjectMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProjectTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProjectTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TaskUpdate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TaskUpdate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Update` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Update` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ProjectMemberOnProjects` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `projectId` on the `ProjectAttachment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `ProjectInvitation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `ProjectMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `ProjectTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `memberId` on the `ProjectTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `TaskModifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `TaskStatusTransitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `TaskUpdate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `TaskUpdate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `Update` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `memberId` on the `UpdateComments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskUpdateId` on the `UpdateComments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `memberId` on the `UpdateRatings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskUpdateId` on the `UpdateRatings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `UpdateRatings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ProjectAttachment" DROP CONSTRAINT "ProjectAttachment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectInvitation" DROP CONSTRAINT "ProjectInvitation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMemberOnProjects" DROP CONSTRAINT "ProjectMemberOnProjects_memberId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMemberOnProjects" DROP CONSTRAINT "ProjectMemberOnProjects_projectId_fkey";

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

-- AlterTable
ALTER TABLE "PlatformInvitation" DROP CONSTRAINT "PlatformInvitation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PlatformInvitation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProjectAttachment" DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProjectInvitation" DROP CONSTRAINT "ProjectInvitation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProjectTask" DROP CONSTRAINT "ProjectTask_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
DROP COLUMN "memberId",
ADD COLUMN     "memberId" INTEGER NOT NULL,
ADD CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaskModifications" DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TaskStatusTransitions" DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TaskUpdate" DROP CONSTRAINT "TaskUpdate_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL,
ADD CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Update" DROP CONSTRAINT "Update_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD CONSTRAINT "Update_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UpdateComments" DROP COLUMN "memberId",
ADD COLUMN     "memberId" INTEGER NOT NULL,
DROP COLUMN "taskUpdateId",
ADD COLUMN     "taskUpdateId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UpdateRatings" DROP COLUMN "memberId",
ADD COLUMN     "memberId" INTEGER NOT NULL,
DROP COLUMN "taskUpdateId",
ADD COLUMN     "taskUpdateId" INTEGER NOT NULL,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ProjectMemberOnProjects";

-- AddForeignKey
ALTER TABLE "ProjectAttachment" ADD CONSTRAINT "ProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
