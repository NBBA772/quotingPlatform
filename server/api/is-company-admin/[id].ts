/**
 * @swagger
 * /api/is-company-admin/{id}:
 *   get:
 *     summary: Check if a user is a company admin
 *     description: >
 *       Returns whether the specified user is a company administrator.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID to check
 *         example: 10
 *     responses:
 *       200:
 *         description: Company admin status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompanyAdmin:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Failed to check company admin status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompanyAdmin:
 *                   type: boolean
 *                   example: false
 */

import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam } from 'h3'

const prisma = new PrismaClient()


export default defineEventHandler(async (event) => {
  try {
    const userId = Number(getRouterParam(event, 'id'))
    if (isNaN(userId)) {
      throw new Error("Invalid userId")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyAdmin: true },
    })

    if (!user) {
      return { isCompanyAdmin: false }
    }

    return { isCompanyAdmin: user.companyAdmin !== null }
  } catch (err) {
    console.error("❌ Error in /api/is-company-admin/[id]:", err)
    event.node.res.statusCode = 500
    return { isCompanyAdmin: false }
  }
})
