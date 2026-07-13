/*
  Warnings:

  - You are about to drop the column `dentalPlan` on the `InsuranceApplication` table. All the data in the column will be lost.
  - You are about to drop the column `visionPlan` on the `InsuranceApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" DROP COLUMN "dentalPlan",
DROP COLUMN "visionPlan",
ADD COLUMN     "visionAndDentalPlan" TEXT;
