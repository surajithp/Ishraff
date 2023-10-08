-- AlterTable
ALTER TABLE "TaskUpdate" ALTER COLUMN "approvedOn" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MobileOtp" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "expiryTime" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MobileOtp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MobileOtp" ADD CONSTRAINT "MobileOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
