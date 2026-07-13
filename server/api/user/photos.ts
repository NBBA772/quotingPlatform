/**
 * @swagger
 * /api/user/photos:
 *   get:
 *     summary: Get authenticated user's photos
 *     description: Fetches all photos uploaded by the currently authenticated user, ordered by newest first.
 *     tags:
 *       - Photos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       url:
 *                         type: string
 *                         example: https://bucket.s3.region.amazonaws.com/memes/1234567890-abcdef.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Failed to fetch photos
 */

import { defineEventHandler, createError, H3Event, getHeader } from "h3";
import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Extract the authorization token from the request header
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    // Fetch the user associated with the token
    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }

    // Fetch photos belonging to the user
    const photos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Return the photos
    return { photos };
  } catch (error: any) {
    console.error("Error fetching photos:", error);
    throw createError({ statusCode: 500, message: error.message || "Server Error" });
  }
});
