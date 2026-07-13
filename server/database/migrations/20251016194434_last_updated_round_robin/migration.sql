/*
  Warnings:

  - Made the column `lastAssignedAt` on table `InsuranceAgent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceAgent" ALTER COLUMN "lastAssignedAt" SET NOT NULL,
ALTER COLUMN "lastAssignedAt" SET DEFAULT CURRENT_TIMESTAMP;
