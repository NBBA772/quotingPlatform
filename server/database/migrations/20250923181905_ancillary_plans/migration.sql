-- CreateTable
CREATE TABLE "public"."AncillaryPlan" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "planName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AncillaryPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AncillaryPlan" ADD CONSTRAINT "AncillaryPlan_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."InsuranceApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
