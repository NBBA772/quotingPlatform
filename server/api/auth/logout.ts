/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Deletes the `auth_token` cookie and ends the user session.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "successfully logged out"
 */
import { deleteCookie } from "h3";

export default eventHandler((event) => {
  deleteCookie(event, 'auth_token', { path: '/' }) // Add path!
  return { message: 'successfully logged out' }
})