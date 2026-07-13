/**
 * @swagger
 * /api/is-app-admin/{id}:
 *   get:
 *     summary: Check if a User is an AppAdmin
 *     tags:
 *       - AppAdmin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Whether the user is an AppAdmin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAdmin:
 *                   type: boolean
 *                   example: true
 */

import { PrismaClient } from "@prisma/client"
import { defineEventHandler, getRouterParam } from "h3"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"))
  if (isNaN(id)) return { isAdmin: false, isAgent: false }

  // Look up the user with both fields
  const user = await prisma.user.findUnique({
    where: { id },
    select: { 
      appAdminId: true,
      insuranceAgent: { select: { id: true } }
    },
  })

  const isAgent = !!user?.insuranceAgent
  const isAdmin = !!user?.appAdminId && !isAgent // Only true if not an agent

  return {
    isAdmin,
    isAgent,
  }
})
