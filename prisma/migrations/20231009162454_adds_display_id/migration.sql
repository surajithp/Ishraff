/*
  Warnings:

  - A unique constraint covering the columns `[displayId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "displayId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_displayId_key" ON "Project"("displayId");
