/*
  Warnings:

  - The `role` column on the `ProjectInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `role` on the `ProjectMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('manager', 'worker', 'guest');

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectInvitation" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'manager';

-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;
