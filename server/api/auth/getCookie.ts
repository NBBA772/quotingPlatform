/**
 * @swagger
 * /api/auth/getCookie:
 *   get:
 *     summary: Get authentication token from cookies
 *     description: Retrieves the `auth_token` cookie value if it exists.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved auth token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authToken:
 *                   type: string
 *                   example: "361aff599c044ed39f5ab536fbe67786"
 *       401:
 *         description: "Unauthorized: No auth token found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 statusMessage:
 *                   type: string
 *                   example: "Unauthorized: No auth token found"
 */
import { defineEventHandler, getCookie, createError } from 'h3';

export default defineEventHandler((event) => {
  // Retrieve the auth_token cookie from the request
  const authToken = getCookie(event, 'auth_token');

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No auth token found',
    });
  }

  return {
    success: true,
    authToken,
  };
});
