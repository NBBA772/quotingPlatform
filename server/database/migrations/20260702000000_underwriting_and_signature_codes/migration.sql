-- AlterTable
ALTER TABLE "InsuranceApplication" ADD COLUMN     "underwritingAnswers" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "signedAt" TIMESTAMP(3),
ADD COLUMN     "signatureMethod" TEXT;

-- CreateTable
CREATE TABLE "SignatureCode" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "codeHash" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignatureCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SignatureCode" ADD CONSTRAINT "SignatureCode_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "InsuranceApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
