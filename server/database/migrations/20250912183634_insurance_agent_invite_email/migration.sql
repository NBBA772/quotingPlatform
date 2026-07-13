-- CreateTable
CREATE TABLE "InsuranceAgentInvite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "invitedById" INTEGER NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "InsuranceAgentInvite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsuranceAgentInvite" ADD CONSTRAINT "InsuranceAgentInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
