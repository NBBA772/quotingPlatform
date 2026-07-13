/*
  Warnings:

  - You are about to drop the column `authorizedAt` on the `PaymentAuthorization` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `PaymentAuthorization` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PaymentAuthorization` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `PaymentAuthorization` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `PaymentAuthorization` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - Added the required column `email` to the `PaymentAuthorization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `PaymentAuthorization` table without a default value. This is not possible if the table is not empty.
  - Made the column `userAgent` on table `PaymentAuthorizationAuditTrail` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."PaymentAuthorization" DROP COLUMN "authorizedAt",
DROP COLUMN "referenceId",
DROP COLUMN "status",
DROP COLUMN "userAgent",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "currency" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."PaymentAuthorizationAuditTrail" ALTER COLUMN "documentHash" DROP NOT NULL,
ALTER COLUMN "userAgent" SET NOT NULL;
