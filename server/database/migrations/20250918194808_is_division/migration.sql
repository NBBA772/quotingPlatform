/*
  Warnings:

  - Added the required column `isDivision` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "isDivision" BOOLEAN NOT NULL;
