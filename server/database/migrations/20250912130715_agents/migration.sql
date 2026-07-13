-- CreateTable
CREATE TABLE "InsuranceAgent" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userId" INTEGER,
    "appAdminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceAgent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceAgent_email_key" ON "InsuranceAgent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceAgent_username_key" ON "InsuranceAgent"("username");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceAgent_userId_key" ON "InsuranceAgent"("userId");

-- AddForeignKey
ALTER TABLE "InsuranceAgent" ADD CONSTRAINT "InsuranceAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceAgent" ADD CONSTRAINT "InsuranceAgent_appAdminId_fkey" FOREIGN KEY ("appAdminId") REFERENCES "AppAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
