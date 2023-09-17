-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'admin';

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- CreateTable
CREATE TABLE "ProjectMemberOnProjects" (
    "projectId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMemberOnProjects_pkey" PRIMARY KEY ("projectId","memberId")
);

-- CreateTable
CREATE TABLE "_ProjectToProjectMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToProjectMember_AB_unique" ON "_ProjectToProjectMember"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToProjectMember_B_index" ON "_ProjectToProjectMember"("B");

-- AddForeignKey
ALTER TABLE "ProjectMemberOnProjects" ADD CONSTRAINT "ProjectMemberOnProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberOnProjects" ADD CONSTRAINT "ProjectMemberOnProjects_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToProjectMember" ADD CONSTRAINT "_ProjectToProjectMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToProjectMember" ADD CONSTRAINT "_ProjectToProjectMember_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
