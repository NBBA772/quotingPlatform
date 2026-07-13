/*
  Warnings:

  - Added the required column `age` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "age" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "height" TEXT NOT NULL,
ADD COLUMN     "weight" TEXT NOT NULL;
