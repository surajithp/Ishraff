/*
  Warnings:

  - The `status` column on the `ProjectInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PROJECT_INVITATION_STATUS" AS ENUM ('accepted', 'rejected', 'not_accepted');

-- DropIndex
DROP INDEX "Project_name_key";

-- AlterTable
ALTER TABLE "ProjectInvitation" DROP COLUMN "status",
ADD COLUMN     "status" "PROJECT_INVITATION_STATUS" NOT NULL DEFAULT 'not_accepted';
