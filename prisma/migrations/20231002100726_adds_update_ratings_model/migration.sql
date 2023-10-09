-- AlterTable
ALTER TABLE "ProjectTask" ADD COLUMN     "managedMemberId" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "TaskModifications" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "oldMemberId" TEXT,
    "newMemberId" TEXT,
    "oldManagedUserId" TEXT,
    "newManagedUserId" TEXT,

    CONSTRAINT "TaskModifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateRatings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "taskUpdateId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "UpdateRatings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskModifications" ADD CONSTRAINT "TaskModifications_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRatings" ADD CONSTRAINT "UpdateRatings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRatings" ADD CONSTRAINT "UpdateRatings_taskUpdateId_fkey" FOREIGN KEY ("taskUpdateId") REFERENCES "TaskUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRatings" ADD CONSTRAINT "UpdateRatings_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
