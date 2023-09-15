-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_memberId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "projectMemberId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
