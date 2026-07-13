/**
 * @swagger
 * /api/company/registration-stats:
 *   get:
 *     summary: Get company registration stats
 *     description: >
 *       Returns the number of employees invited and the number of employees who have completed registration
 *       for the company associated with the authenticated user.
 *     tags:
 *       - Company
 *     security:
 *       - cookieAuth: []  # uses auth_token cookie
 *     responses:
 *       200:
 *         description: Successfully retrieved registration stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invitedCount:
 *                   type: integer
 *                   example: 10
 *                 registeredCount:
 *                   type: integer
 *                   example: 7
 *       400:
 *         description: User is not linked to a company
 *       401:
 *         description: Unauthorized or missing auth token
 */

import prisma from '~/server/database/client'
import { getCookie, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, 'auth_token')
  if (!authToken) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true },
  })
  const user = session?.user
  if (!user?.companyId) throw createError({ statusCode: 400, statusMessage: 'User not linked to company' })

  const invitedCount = await prisma.employeeInvite.count({
    where: { companyId: user.companyId },
  })

  const registeredCount = await prisma.employeeInvite.count({
    where: {
      companyId: user.companyId,
      acceptedAt: { not: null },
    },
  })

  return { invitedCount, registeredCount }
})
