/*
  Warnings:

  - Made the column `city` on table `InsuranceApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `InsuranceApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `streetAddress` on table `InsuranceApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zipCode` on table `InsuranceApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "streetAddress" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL;
