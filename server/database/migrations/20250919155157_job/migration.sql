/*
  Warnings:

  - Added the required column `hrsPerWeek` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "hrsPerWeek" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "middleName" TEXT;
