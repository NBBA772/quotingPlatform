/*
  Warnings:

  - The `visionAndDentalPlan` column on the `InsuranceApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" DROP COLUMN "visionAndDentalPlan",
ADD COLUMN     "visionAndDentalPlan" BOOLEAN;
