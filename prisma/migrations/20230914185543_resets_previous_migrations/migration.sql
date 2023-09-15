/*
  Warnings:

  - You are about to drop the column `projectMemberId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectMemberId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "projectMemberId";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_managedUserId_fkey" FOREIGN KEY ("managedUserId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
