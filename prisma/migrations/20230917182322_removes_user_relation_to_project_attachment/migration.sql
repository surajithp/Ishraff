/*
  Warnings:

  - Added the required column `addedBy` to the `ProjectAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectAttachment" DROP CONSTRAINT "ProjectAttachment_userId_fkey";

-- AlterTable
ALTER TABLE "ProjectAttachment" ADD COLUMN     "addedBy" TEXT NOT NULL;
