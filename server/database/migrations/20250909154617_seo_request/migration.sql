-- CreateTable
CREATE TABLE "SEORequest" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEORequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SEORequest" ADD CONSTRAINT "SEORequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
