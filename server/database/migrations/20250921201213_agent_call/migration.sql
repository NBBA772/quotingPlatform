-- AlterTable
ALTER TABLE "public"."InsuranceAgent" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOnCall" BOOLEAN NOT NULL DEFAULT false;
