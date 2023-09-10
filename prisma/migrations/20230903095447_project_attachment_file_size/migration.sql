/*
  Warnings:

  - Changed the type of `attachmentSize` on the `ProjectAttachment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProjectAttachment" DROP COLUMN "attachmentSize",
ADD COLUMN     "attachmentSize" BIGINT NOT NULL;
