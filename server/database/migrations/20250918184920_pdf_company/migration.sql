/*
  Warnings:

  - Added the required column `hireDate` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rehireDate` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "hireDate" TEXT NOT NULL,
ADD COLUMN     "rehireDate" TEXT NOT NULL;
