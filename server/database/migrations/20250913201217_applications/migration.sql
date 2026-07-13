-- CreateTable
CREATE TABLE "public"."InsuranceApplication" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupNumber" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "healthPlan" TEXT,
    "dentalPlan" TEXT,
    "visionPlan" TEXT,
    "lifeAncillaryPlan" TEXT,
    "pdfUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InsuranceApplication" ADD CONSTRAINT "InsuranceApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
