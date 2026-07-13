-- AlterTable
ALTER TABLE "public"."PaymentAuthorization" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "cardNumber" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "expiration" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip" TEXT;
