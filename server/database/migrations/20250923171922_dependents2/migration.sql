/*
  Warnings:

  - Added the required column `height` to the `Dependent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialSecurityNumber` to the `Dependent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Dependent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Dependent" ADD COLUMN     "height" TEXT NOT NULL,
ADD COLUMN     "socialSecurityNumber" TEXT NOT NULL,
ADD COLUMN     "weight" TEXT NOT NULL;
