/*
  Warnings:

  - Added the required column `spouseFirstName` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spouseLastName` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spouseMiddleName` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "spouseFirstName" TEXT NOT NULL,
ADD COLUMN     "spouseLastName" TEXT NOT NULL,
ADD COLUMN     "spouseMiddleName" TEXT NOT NULL;
