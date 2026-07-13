-- AlterTable
ALTER TABLE "public"."PaymentAuthorizationAuditTrail" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
