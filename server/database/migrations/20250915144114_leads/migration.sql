-- CreateTable
CREATE TABLE "public"."LeadInvite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "leadId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadInvite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."LeadInvite" ADD CONSTRAINT "LeadInvite_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadInvite" ADD CONSTRAINT "LeadInvite_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
