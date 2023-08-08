-- AlterTable
ALTER TABLE "PlatformInvitation" ADD COLUMN     "receiverEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "receiverMobile" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "receiverName" TEXT NOT NULL DEFAULT '';
