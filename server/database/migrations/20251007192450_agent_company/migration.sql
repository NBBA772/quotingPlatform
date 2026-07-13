-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "agentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."InsuranceAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
