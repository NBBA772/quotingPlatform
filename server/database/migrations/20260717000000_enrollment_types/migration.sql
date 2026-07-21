-- Enrollment types + agent permissions + custom plans (additive, idempotent)

-- Company: enrollment mode discriminator
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "enrollmentType" TEXT NOT NULL DEFAULT 'individual';
-- Backfill: real registered companies (non-"Individual" industry) become group companies
UPDATE "Company" SET "enrollmentType" = 'group' WHERE "industry" <> 'Individual' AND "enrollmentType" = 'individual';

-- InsuranceAgent: which enrollment modes the agent may work in
ALTER TABLE "InsuranceAgent" ADD COLUMN IF NOT EXISTS "canIndividual" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "InsuranceAgent" ADD COLUMN IF NOT EXISTS "canGroup" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "InsuranceAgent" ADD COLUMN IF NOT EXISTS "canCustom" BOOLEAN NOT NULL DEFAULT false;

-- CustomPlan + benefits
CREATE TABLE IF NOT EXISTS "CustomPlan" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "planType" TEXT,
  "networkType" TEXT,
  "pdfUrl" TEXT,
  "priceSingle" DOUBLE PRECISION,
  "priceIndividualSpouse" DOUBLE PRECISION,
  "priceIndividualChild" DOUBLE PRECISION,
  "priceFamily" DOUBLE PRECISION,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CustomPlanBenefit" (
  "id" SERIAL NOT NULL,
  "customPlanId" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  CONSTRAINT "CustomPlanBenefit_pkey" PRIMARY KEY ("id")
);

-- InsuranceApplication: chosen custom plan
ALTER TABLE "InsuranceApplication" ADD COLUMN IF NOT EXISTS "customPlanId" INTEGER;

-- Foreign keys (guarded so re-runs don't error)
DO $$ BEGIN
  ALTER TABLE "CustomPlan" ADD CONSTRAINT "CustomPlan_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CustomPlanBenefit" ADD CONSTRAINT "CustomPlanBenefit_customPlanId_fkey"
    FOREIGN KEY ("customPlanId") REFERENCES "CustomPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InsuranceApplication" ADD CONSTRAINT "InsuranceApplication_customPlanId_fkey"
    FOREIGN KEY ("customPlanId") REFERENCES "CustomPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
