-- AgentAdmin (upline/manager) + relations (additive, idempotent)

CREATE TABLE IF NOT EXISTS "AgentAdmin" (
  "id" SERIAL NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentAdmin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AgentAdmin_username_key" ON "AgentAdmin"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "AgentAdmin_email_key" ON "AgentAdmin"("email");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agentAdminId" INTEGER;
ALTER TABLE "InsuranceAgent" ADD COLUMN IF NOT EXISTS "agentAdminId" INTEGER;

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_agentAdminId_fkey"
    FOREIGN KEY ("agentAdminId") REFERENCES "AgentAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InsuranceAgent" ADD CONSTRAINT "InsuranceAgent_agentAdminId_fkey"
    FOREIGN KEY ("agentAdminId") REFERENCES "AgentAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
