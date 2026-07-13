-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "spouseAge" TEXT,
ADD COLUMN     "spouseDateOfBirth" TIMESTAMP(3),
ADD COLUMN     "spouseGender" TEXT,
ADD COLUMN     "spouseHeight" TEXT,
ADD COLUMN     "spouseSocialSecurityNumber" TEXT,
ADD COLUMN     "spouseWeight" TEXT;
