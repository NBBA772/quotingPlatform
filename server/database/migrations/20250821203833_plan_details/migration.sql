-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "coverageEnd" TIMESTAMP(3),
ADD COLUMN     "coverageStart" TIMESTAMP(3),
ADD COLUMN     "networkType" TEXT,
ADD COLUMN     "outOfNetwork" BOOLEAN,
ADD COLUMN     "primaryCareRequired" BOOLEAN,
ADD COLUMN     "referralRequired" BOOLEAN;
