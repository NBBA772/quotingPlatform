-- ApplicationPdf: PDF version history per application (additive, idempotent)

CREATE TABLE IF NOT EXISTS "ApplicationPdf" (
  "id" SERIAL NOT NULL,
  "applicationId" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'unsigned',
  "signed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationPdf_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ApplicationPdf_applicationId_idx" ON "ApplicationPdf"("applicationId");

DO $$ BEGIN
  ALTER TABLE "ApplicationPdf" ADD CONSTRAINT "ApplicationPdf_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "InsuranceApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill: seed one version from each application's current pdfUrl so the
-- admin immediately sees existing PDFs. Only when no version exists yet.
INSERT INTO "ApplicationPdf" ("applicationId", "url", "kind", "signed", "createdAt")
SELECT a."id", a."pdfUrl",
       CASE WHEN a."status" = 'signed' OR a."signedAt" IS NOT NULL THEN 'signed' ELSE 'unsigned' END,
       (a."status" = 'signed' OR a."signedAt" IS NOT NULL),
       COALESCE(a."signedAt", a."updatedAt", CURRENT_TIMESTAMP)
FROM "InsuranceApplication" a
WHERE a."pdfUrl" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "ApplicationPdf" p WHERE p."applicationId" = a."id");
