-- CreateTable
CREATE TABLE "public"."AuditTrail" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "insuranceApplicationId" INTEGER,
    "signer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "documentHash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AuditTrail" ADD CONSTRAINT "AuditTrail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditTrail" ADD CONSTRAINT "AuditTrail_insuranceApplicationId_fkey" FOREIGN KEY ("insuranceApplicationId") REFERENCES "public"."InsuranceApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
