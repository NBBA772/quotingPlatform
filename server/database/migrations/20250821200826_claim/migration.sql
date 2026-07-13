-- CreateTable
CREATE TABLE "ClaimSupport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL,
    "maxCoverage" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "portalUrl" TEXT,
    "officeHours" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimSupport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClaimSupport" ADD CONSTRAINT "ClaimSupport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
