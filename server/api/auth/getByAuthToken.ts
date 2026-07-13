/**
 * @swagger
 * /api/auth/getByAuthToken:
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
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: No auth token found in cookies
 */
import { defineEventHandler, getCookie } from "h3";

export default defineEventHandler(async (event) => {
   
    const authToken = getCookie(event, 'auth_token')  
    
    return authToken
})