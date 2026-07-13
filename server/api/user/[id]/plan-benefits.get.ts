/**
 * @swagger
 * /api/user/{id}/plan-benefits:
 *   get:
 *     summary: Get a user's plan benefits
 *     description: Fetches all benefits associated with the user's active plan.
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
 *         description: List of plan benefits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 benefits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Name of the benefit
 *                       description:
 *                         type: string
 *                         description: Detailed description of the benefit
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Failed to fetch plan benefits
 */

import prisma from "~/server/database/client";
import { defineEventHandler, getRouterParam, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id")); // same pattern as insurance card
    if (!id) throw createError({ statusCode: 400, message: "Invalid user ID" });

    // Fetch the user's plan and benefits
    const plan = await prisma.plan.findFirst({
      where: { userId: id },
      include: { benefits: true },
    });

    if (!plan) return { benefits: [] };

    const benefits = plan.benefits.map(b => ({
      name: b.name,
      description: b.description,
    }));

    return { benefits };
  } catch (error: any) {
    console.error("❌ Fetch plan benefits error:", error);
    throw createError({ statusCode: 500, message: error.message || "Failed to fetch plan benefits" });
  }
});
