-- AlterTable
ALTER TABLE "ProjectAttachment" ADD COLUMN     "attachmentName" TEXT NOT NULL DEFAULT 'FileName';

-- AlterTable
ALTER TABLE "TaskUpdate" ADD COLUMN     "attachementName" TEXT;
