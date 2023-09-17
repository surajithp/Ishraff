/*
  Warnings:

  - You are about to drop the column `memberId` on the `ProjectAttachment` table. All the data in the column will be lost.
  - Added the required column `userId` to the `ProjectAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectAttachment" DROP CONSTRAINT "ProjectAttachment_memberId_fkey";

-- AlterTable
ALTER TABLE "ProjectAttachment" DROP COLUMN "memberId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectAttachment" ADD CONSTRAINT "ProjectAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
