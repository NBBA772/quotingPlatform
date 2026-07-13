/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Update authenticated user profile
 *     description: Updates the current user's profile. Requires a Bearer token.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Jane"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Failed to update user profile
 */

import { defineEventHandler, readBody, getHeader, createError } from "h3";
import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/app/services/sessionService";

export default defineEventHandler(async (event) => {
  try {
    const updatedUserData = await readBody(event);

    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Missing authorization token" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error in user.post.ts:", error.message || error);
    throw createError({ statusCode: 500, message: "Failed to update user profile." });
  }
});
