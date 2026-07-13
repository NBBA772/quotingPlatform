/**
 * @swagger
 * /api/user/insurance-card:
 *   get:
 *     summary: Get the authenticated user's insurance card
 *     description: Returns the insurance card image URL for the currently authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insurance card fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   nullable: true
 *                   example: https://bucket.s3.region.amazonaws.com/insurance-cards/insurance-123456.jpg
 *       401:
 *         description: Unauthorized — missing or invalid auth token
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch insurance card
 */

import { defineEventHandler, getHeader, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" });

    const user = await prisma.user.findFirst({
      where: { session: { some: { authToken } } },
      select: { insuranceCardImage: true },
    });

    if (!user) throw createError({ statusCode: 404, message: "User not found" });

    return { imageUrl: user.insuranceCardImage || null };
  } catch (err: any) {
    console.error("Error fetching insurance card:", err);
    throw createError({ statusCode: 500, message: "Failed to fetch insurance card" });
  }
});
