/**
 * @swagger
 * /api/providers/{id}:
 *   post:
 *     summary: Save providers for a specific user
 *     description: Deletes any existing providers for the given user and inserts new providers in bulk.
 *     tags:
 *       - Providers
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID to assign providers to
 *         required: true
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
 *                   description: Type of provider (e.g., doctor, dentist)
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
 *         description: Providers successfully saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of providers created
 *                 providers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
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
 *         description: Invalid userId
 *       500:
 *         description: Failed to save providers
 */

import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.id);
  const body = await readBody(event);

  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, message: "Invalid userId" });
  }

  try {
    // Delete existing providers for this user
    await prisma.provider.deleteMany({ where: { userId } });

    // Insert new providers
    const newProviders = await prisma.provider.createMany({
      data: body.map((p: any) => ({
        userId,
        name: p.name,
        type: p.type,
        location: p.location,
        specialty: p.specialty,
        phone: p.phone,
        email: p.email,
        address: p.address,
        city: p.city,
        state: p.state,
        zipCode: p.zipCode,
      })),
    });

    return { success: true, count: newProviders.count, providers: body };
  } catch (err: any) {
    console.error("Error saving providers:", err);
    throw createError({ statusCode: 500, message: "Failed to save providers" });
  }
});
