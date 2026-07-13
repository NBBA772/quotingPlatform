/**
 * @swagger
 * /api/providers/{userId}:
 *   get:
 *     summary: Fetch providers for a specific user
 *     description: Retrieves all providers associated with the given user ID.
 *     tags:
 *       - Providers
 *     parameters:
 *       - name: userId
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
 *                       userId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         description: Type of provider (e.g., doctor, dentist)
 *                       location:
 *                         type: string
 *                       specialty:
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

import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.userId);

  if (!userId) {
    return { providers: [] };
  }

  try {
    const providers = await prisma.provider.findMany({
      where: { userId },
    });
    return { providers };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return { providers: [] };
  }
});
