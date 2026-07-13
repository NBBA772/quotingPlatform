/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Get providers for a specific user
 *     description: Fetches all healthcare or service providers linked to a specific user by their user ID.
 *     tags:
 *       - Company
 *       - Providers
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID to fetch providers for
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of providers for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 providers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         description: Type of provider (e.g., doctor, dentist)
 *                       specialty:
 *                         type: string
 *                       location:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       address:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *       400:
 *         description: Invalid userId
 *       500:
 *         description: Failed to fetch providers
 */

import { defineEventHandler, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.id);

  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, message: "Invalid userId" });
  }

  try {
    const providers = await prisma.provider.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        location: true,
        specialty: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });

    return { providers };
  } catch (err: any) {
    console.error("Error fetching providers:", err);
    throw createError({ statusCode: 500, message: "Failed to fetch providers" });
  }
});
