/*
  Warnings:

  - Added the required column `location` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
