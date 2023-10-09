/*
  Warnings:

  - You are about to drop the `_ProjectToProjectMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectToProjectMember" DROP CONSTRAINT "_ProjectToProjectMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToProjectMember" DROP CONSTRAINT "_ProjectToProjectMember_B_fkey";

-- DropTable
DROP TABLE "_ProjectToProjectMember";

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
