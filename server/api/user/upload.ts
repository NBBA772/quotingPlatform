import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getHeader, readMultipartFormData, createError } from "h3";
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
    // 1. Auth
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });

    const user = await getUserByAuthToken(authToken);
    if (!user) throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });

    // 2. Parse files
    const formData = await readMultipartFormData(event);
    console.log("Received files:", formData.map(f => f.name));
    const avatarFile = formData.find((f) => f.name === "avatar");
    const coverFile = formData.find((f) => f.name === "cover");
    const insuranceCardFile = formData.find((f) => f.name === "insuranceCard");

    if (!avatarFile && !coverFile && !insuranceCardFile) {
      throw createError({ statusCode: 400, message: "No files uploaded" });
    }

    // 3. Upload helper
    const uploadAndReturnUrl = async (file, folder: string) => {
      const ext = file.filename.split(".").pop();
      const key = `${folder}/${Date.now()}-${nanoid()}.${ext}`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.data,
        ContentType: file.type,
      }));

      return `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    };

    const uploadedFiles = {
      avatar: avatarFile ? await uploadAndReturnUrl(avatarFile, "avatars") : null,
      cover: coverFile ? await uploadAndReturnUrl(coverFile, "covers") : null,
      insuranceCard: insuranceCardFile ? await uploadAndReturnUrl(insuranceCardFile, "insurance-cards") : null,
    };

    // 4. Save to photo table for avatar/cover (optional)
    const photoRecords = await Promise.all(
      Object.entries(uploadedFiles)
        .filter(([key, url]) => url && key !== "insuranceCard") // don't store insurance card in general gallery
        .map(([_, url]) => prisma.photo.create({ data: { userId: user.id, url } }))
    );

    // 5. Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatar: uploadedFiles.avatar || user.avatar,
        coverImage: uploadedFiles.cover || user.coverImage,
        insuranceCardImage: uploadedFiles.insuranceCard || user.insuranceCardImage, // <-- new field
      },
    });

    return {
      success: true,
      files: uploadedFiles,
      user: {
        avatar: updatedUser.avatar,
        coverImage: updatedUser.coverImage,
        insuranceCardImage: updatedUser.insuranceCardImage,
      },
      photos: photoRecords,
    };
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    throw createError({ statusCode: 500, message: error.message || "Upload failed" });
  }
});
