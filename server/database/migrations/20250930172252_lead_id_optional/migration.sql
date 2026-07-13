-- DropForeignKey
ALTER TABLE "public"."LeadInvite" DROP CONSTRAINT "LeadInvite_leadId_fkey";

-- AlterTable
ALTER TABLE "public"."LeadInvite" ALTER COLUMN "leadId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."LeadInvite" ADD CONSTRAINT "LeadInvite_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
