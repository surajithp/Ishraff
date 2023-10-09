/*
  Warnings:

  - You are about to drop the `TASKUPDATE` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TASKUPDATE" DROP CONSTRAINT "TASKUPDATE_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TASKUPDATE" DROP CONSTRAINT "TASKUPDATE_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TASKUPDATE" DROP CONSTRAINT "TASKUPDATE_userId_fkey";

-- DropTable
DROP TABLE "TASKUPDATE";

-- CreateTable
CREATE TABLE "TaskUpdate" (
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

    CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateComments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    "taskUpdateId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "UpdateComments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateComments" ADD CONSTRAINT "UpdateComments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateComments" ADD CONSTRAINT "UpdateComments_taskUpdateId_fkey" FOREIGN KEY ("taskUpdateId") REFERENCES "TaskUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
