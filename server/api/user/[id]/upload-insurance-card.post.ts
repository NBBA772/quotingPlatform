/**
 * @swagger
 * /api/user/{id}/upload-insurance-card:
 *   post:
 *     summary: Upload a user's insurance card
 *     description: Uploads an insurance, dental, or vision card image to AWS S3 and creates a corresponding insurance card record.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               insuranceCard:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               relation:
 *                 type: string
 *                 description: 'Family relation: "Self", "Spouse", "Child", "Other"'
 *               type:
 *                 type: string
 *                 description: 'Type of card: "Health", "Dental", or "Vision"'
 *     responses:
 *       200:
 *         description: Card uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 card:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     relation:
 *                       type: string
 *                     type:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid user ID, missing file, relation, or card type
 *       404:
 *         description: User not found
 *       500:
 *         description: Upload failed
 */


// /api/user/[id]/upload-insurance-card.post.ts
import prisma from "~/server/database/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readMultipartFormData, createError } from "h3";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET;

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    const userId = Number(id);
    if (!userId) throw createError({ statusCode: 400, message: "Invalid user ID" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw createError({ statusCode: 404, message: "User not found" });

    const formData = await readMultipartFormData(event);
    const insuranceCardFile = formData.find((f) => f.name === "insuranceCard");
    const relationField = formData.find((f) => f.name === "relation");
    const typeField = formData.find((f) => f.name === "type");

    if (!insuranceCardFile) throw createError({ statusCode: 400, message: "No file uploaded" });
    if (!relationField) throw createError({ statusCode: 400, message: "No relation provided" });
    if (!typeField) throw createError({ statusCode: 400, message: "No card type provided" });

    const relation = relationField.data.toString();
    const type = typeField.data.toString();

    const ext = insuranceCardFile.filename.split(".").pop();
    const key = `insurance-cards/${type.toLowerCase()}-${Date.now()}-${nanoid()}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: insuranceCardFile.data,
      ContentType: insuranceCardFile.type,
    }));

    const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    const card = await prisma.insuranceCard.create({
      data: {
        userId,
        relation,
        type,
        imageUrl,
      },
    });

    return { success: true, card };
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    throw createError({ statusCode: error.statusCode || 500, message: error.message || "Upload failed" });
  }
});
