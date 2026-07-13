-- CreateTable
CREATE TABLE "public"."Dependent" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "age" TEXT,
    "gender" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Dependent" ADD CONSTRAINT "Dependent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."InsuranceApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
