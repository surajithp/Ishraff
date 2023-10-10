/*
  Warnings:

  - The `oldMemberId` column on the `TaskModifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `newMemberId` column on the `TaskModifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `managedMemberId` on the `ProjectTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProjectTask" ALTER COLUMN "managedUserName" DROP DEFAULT,
DROP COLUMN "managedMemberId",
ADD COLUMN     "managedMemberId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TaskModifications" DROP COLUMN "oldMemberId",
ADD COLUMN     "oldMemberId" INTEGER,
DROP COLUMN "newMemberId",
ADD COLUMN     "newMemberId" INTEGER;
