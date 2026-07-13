import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { formidable } from "formidable";
import fs from "fs";
import prisma from "~/server/database/client";
import { createError, getHeader } from "h3";

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
    // 1️⃣ Parse form
    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log("Parsed fields:", fields);
    console.log("Parsed files:", files);

    const { groupNumber, groupName, healthPlan } = fields;

    if (!groupNumber) throw createError({ statusCode: 400, message: "Missing group number" });
    if (!groupName) throw createError({ statusCode: 400, message: "Missing group name" });

    if (!files.pdf) throw createError({ statusCode: 400, message: "Missing PDF file" });

    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    // 2️⃣ Upload PDF to S3
    const fileStream = fs.createReadStream(pdfFile.filepath);
    const s3Key = `applications/${Date.now()}-${pdfFile.originalFilename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: "application/pdf",
      })
    );

    const pdfUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`;
    console.log("PDF uploaded to S3:", pdfUrl);

    // 3️⃣ Authenticated user
    const authHeader = getHeader(event, "authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const session = await prisma.session.findUnique({
      where: { authToken: token },
      include: { user: true },
    });

    if (!session?.user) throw createError({ statusCode: 401, message: "Unauthorized" });

    // 4️⃣ Create application
    const application = await prisma.insuranceApplication.create({
    data: {
        userId: session.user.id,
        groupNumber: Array.isArray(fields.groupNumber) ? fields.groupNumber[0] : fields.groupNumber,
        groupName: Array.isArray(fields.groupName) ? fields.groupName[0] : fields.groupName,
        healthPlan: Array.isArray(fields.healthPlan) ? fields.healthPlan[0] : fields.healthPlan,
        pdfUrl
    }
    });

    console.log("Created application:", application);

    return { application };
  } catch (err: any) {
    console.error("Upload PDF error:", err);
    throw createError({ statusCode: 500, message: err.message || "internal server error" });
  }
});
