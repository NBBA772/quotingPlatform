-- AlterTable
ALTER TABLE "public"."InsuranceApplication" ALTER COLUMN "spouseFirstName" DROP NOT NULL,
ALTER COLUMN "spouseLastName" DROP NOT NULL,
ALTER COLUMN "spouseMiddleName" DROP NOT NULL;
