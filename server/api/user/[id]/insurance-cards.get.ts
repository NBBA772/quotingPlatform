/**
 * @swagger
 * /api/user/{id}/insurance-cards:
 *   get:
 *     summary: Get a user's insurance card images
 *     description: Fetches all insurance, dental, and vision card images for a specific user, grouped by family member.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User's insurance card images grouped by member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for this member (e.g., "Child-1")
 *                       relation:
 *                         type: string
 *                         description: "Self, Spouse, Child, Other"
 *                       cards:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             type:
 *                               type: string
 *                               description: "Health, Dental, Vision"
 *                             imageUrl:
 *                               type: string
 *                               format: uri
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch insurance card images
 */



// /api/user/[id]/insurance-cards.get.ts
import prisma from "~/server/database/client";
import { defineEventHandler, getRouterParam, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (!id) throw createError({ statusCode: 400, message: "Invalid user ID" });

    const cards = await prisma.insuranceCard.findMany({
      where: { userId: id },
      orderBy: { createdAt: "asc" },
    });

    return { cards };
  } catch (error: any) {
    console.error("❌ Fetch insurance cards error:", error);
    throw createError({ statusCode: 500, message: error.message || "Failed to fetch insurance cards" });
  }
});
