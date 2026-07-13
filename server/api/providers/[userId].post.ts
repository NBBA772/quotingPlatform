/**
 * @swagger
 * /api/providers/{userId}:
 *   post:
 *     summary: Create or replace providers for a user
 *     description: Deletes existing providers for the given user ID and creates new providers from the request body.
 *     tags:
 *       - Providers
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user whose providers will be replaced
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 location:
 *                   type: string
 *                 specialty:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 address:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 zipCode:
 *                   type: string
 *     responses:
 *       200:
 *         description: Providers successfully created
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
 *         description: Invalid userId or request body
 *       500:
 *         description: Failed to save providers
 */

import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.userId);
  const body = await readBody(event);

  if (!userId) {
    throw new Error("UserId missing");
  }

  try {
    // Clear out existing providers for this user
    await prisma.provider.deleteMany({ where: { userId } });

    // Recreate providers from body
    const created = await prisma.$transaction(
      body.map((p: any) =>
        prisma.provider.create({
          data: {
            userId,
            name: p.name,
            type: p.type,
            location: p.location,
          },
        })
      )
    );

    return { providers: created };
  } catch (error) {
    console.error("Error saving providers:", error);
    throw error;
  }
});
