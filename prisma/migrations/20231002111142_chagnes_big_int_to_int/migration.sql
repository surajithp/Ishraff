/*
  Warnings:

  - You are about to alter the column `attachmentSize` on the `TaskUpdate` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "TaskUpdate" ALTER COLUMN "attachmentSize" SET DATA TYPE INTEGER;
