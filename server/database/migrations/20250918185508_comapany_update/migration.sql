/*
  Warnings:

  - Changed the type of `hireDate` on the `InsuranceApplication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `rehireDate` on the `InsuranceApplication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."InsuranceApplication" DROP COLUMN "hireDate",
ADD COLUMN     "hireDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "rehireDate",
ADD COLUMN     "rehireDate" TIMESTAMP(3) NOT NULL;
