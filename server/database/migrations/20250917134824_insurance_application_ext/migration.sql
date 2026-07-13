/*
  Warnings:

  - Added the required column `dateOfBirth` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialSecurityNumber` to the `InsuranceApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "socialSecurityNumber" TEXT NOT NULL;
