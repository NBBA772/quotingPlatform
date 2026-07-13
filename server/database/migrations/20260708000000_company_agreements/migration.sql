-- AlterTable: SignatureCode now serves both insurance applications and company agreements
ALTER TABLE "SignatureCode" ALTER COLUMN "applicationId" DROP NOT NULL;
ALTER TABLE "SignatureCode" ADD COLUMN "companyAgreementId" INTEGER;

-- CreateTable
CREATE TABLE "CompanyAgreement" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "agentId" INTEGER,
    "contactFirstName" TEXT NOT NULL,
    "contactLastName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "reviewToken" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signedAt" TIMESTAMP(3),
    "signatureMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAgreement_reviewToken_key" ON "CompanyAgreement"("reviewToken");

-- AddForeignKey
ALTER TABLE "CompanyAgreement" ADD CONSTRAINT "CompanyAgreement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompanyAgreement" ADD CONSTRAINT "CompanyAgreement_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "InsuranceAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SignatureCode" ADD CONSTRAINT "SignatureCode_companyAgreementId_fkey" FOREIGN KEY ("companyAgreementId") REFERENCES "CompanyAgreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
