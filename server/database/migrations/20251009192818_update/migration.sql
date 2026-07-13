/*
  Warnings:

  - Added the required column `amount` to the `PaymentAuthorization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `PaymentAuthorization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PaymentAuthorization" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "authorizedAt" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "signatureImageUrl" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SIGNED',
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "public"."PaymentAuthorizationAuditTrail" ADD COLUMN     "userAgent" TEXT;
