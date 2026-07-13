-- CreateTable
CREATE TABLE "public"."PaymentAuthorization" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentAuthorizationAuditTrail" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentAuthorizationId" INTEGER NOT NULL,
    "signer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "documentHash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAuthorizationAuditTrail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PaymentAuthorization" ADD CONSTRAINT "PaymentAuthorization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAuthorizationAuditTrail" ADD CONSTRAINT "PaymentAuthorizationAuditTrail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAuthorizationAuditTrail" ADD CONSTRAINT "PaymentAuthorizationAuditTrail_paymentAuthorizationId_fkey" FOREIGN KEY ("paymentAuthorizationId") REFERENCES "public"."PaymentAuthorization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
