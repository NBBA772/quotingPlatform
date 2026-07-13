/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the user associated with the provided Bearer token.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

import prisma from '~/server/database/client';
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository';
import { getHeader, createError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '');
    if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' });

    const user = await getUserByAuthToken(authToken);
    if (!user) throw createError({ statusCode: 404, message: 'User not found' });

    return user;
  } catch (err: any) {
    console.error('Error in /api/user:', err); // <-- check the logs
    throw createError({ statusCode: 500, message: err.message });
  }
});
