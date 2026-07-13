import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs/promises";
import prisma from "~/server/database/client";
import { createError, getHeader } from "h3";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export default defineEventHandler(async (event) => {
  try {
    // Parse form (expecting applicationId + pdf)
    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { applicationId } = fields;
    if (!applicationId) {
      throw createError({ statusCode: 400, statusMessage: "Missing application ID" });
    }

    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (!pdfFile) {
      throw createError({ statusCode: 400, statusMessage: "PDF file missing" });
    }

    // Read PDF buffer
    const pdfBuffer = await fs.readFile(pdfFile.filepath);

    // Upload PDF to S3
    const s3Key = `applications/${applicationId}-${Date.now()}.pdf`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    const pdfUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`;

    // Auth check
    const authHeader = getHeader(event, "authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const session = await prisma.session.findUnique({
      where: { authToken: token },
      include: { user: true },
    });
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    // Get client IP
    const ip = event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress || 'unknown';

    // Generate SHA-256 hash of the PDF for audit trail
    const documentHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // Save IP and signer in audit trail
    await prisma.auditTrail.create({
      data: {
        userId: session.user.id,
        insuranceApplicationId: Number(applicationId),
        ip: String(ip),
        signer: `${session.user.firstName} ${session.user.lastName}`,
        email: session.user.email,
        documentHash, 
        action: "E-sign",
      }
    });

    // Update application with PDF URL and mark it signed so downstream
    // steps (payment) unlock for this application
    const updatedApplication = await prisma.insuranceApplication.update({
      where: { id: Number(applicationId) },
      data: {
        pdfUrl,
        status: "signed",
        signedAt: new Date(),
        signatureMethod: "signature",
      },
    });

    return { success: true, pdfUrl: updatedApplication.pdfUrl };

  } catch (err: any) {
    console.error(err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || "Internal server error",
    });
  }
});
