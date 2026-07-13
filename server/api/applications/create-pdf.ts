import { PDFDocument } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getHeader, createError, readBody } from "h3";
import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export default defineEventHandler(async (event) => {
  try {
    // 1. Auth
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });

    const user = await getUserByAuthToken(authToken);
    if (!user) throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });

    // 2. Get form data
    const body = await readBody(event);

    // 3. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();

    page.drawText(`Group #: ${body.groupNumber}`, { x: 50, y: height - 50, size: 14 });
    page.drawText(`Group Name: ${body.groupName}`, { x: 50, y: height - 80, size: 14 });
    page.drawText(`Health Plan: ${body.healthPlan}`, { x: 50, y: height - 110, size: 14 });
    page.drawText(`Dental Plan: ${body.dentalPlan}`, { x: 50, y: height - 140, size: 14 });
    page.drawText(`Vision Plan: ${body.visionPlan}`, { x: 50, y: height - 170, size: 14 });
    page.drawText(`Life & Ancillary: ${body.lifeAncillaryPlan}`, { x: 50, y: height - 200, size: 14 });

    const pdfBytes = await pdfDoc.save();

    // 4. Upload to S3
    const fileKey = `applications/${uuidv4()}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        Body: pdfBytes,
        ContentType: "application/pdf",
      })
    );

    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileKey}`;

    // 5. Save record in Prisma (optional but recommended)
    const applicationRecord = await prisma.insuranceApplication.create({
      data: {
        userId: user.id,
        groupNumber: body.groupNumber,
        groupName: body.groupName,
        healthPlan: body.healthPlan,
        dentalPlan: body.dentalPlan,
        visionPlan: body.visionPlan,
        lifeAncillaryPlan: body.lifeAncillaryPlan,
        pdfUrl: fileUrl,
      },
    });

    return { success: true, url: fileUrl, application: applicationRecord };
  } catch (error: any) {
    console.error("❌ PDF creation error:", error);
    throw createError({ statusCode: 500, message: error.message || "PDF creation failed" });
  }
});
