/**
 * @swagger
 * /api/company/coverage-summary:
 *   get:
 *     summary: Get coverage summary for a company's employees
 *     description: >
 *       Returns a summary of active employees and the count of their assigned plans. 
 *       Requires a valid `auth_token` cookie for an authenticated user associated with a company.
 *     tags:
 *       - Company
 *     security:
 *       - cookieAuth: []   # Indicates that auth_token cookie is required
 *     responses:
 *       200:
 *         description: Coverage summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   planName:
 *                     type: string
 *                     example: "PPO Standard"
 *                   count:
 *                     type: integer
 *                     example: 5
 *       400:
 *         description: User is not associated with a company
 *       401:
 *         description: Missing or invalid auth token
 *       500:
 *         description: Failed to retrieve coverage summary
 */

import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, "auth_token")
  if (!authToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
  }

  const user = await getUserByAuthToken(authToken)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })
  }

  if (!user.companyId) {
    throw createError({ statusCode: 400, statusMessage: 'User is not associated with a company' })
  }

  const companyId = user.companyId

  // Get all active, non-deleted employees
  const employees = await prisma.employee.findMany({
    where: { companyId, deletedAt: null, isActive: true },
    include: {
      user: {
        include: { plans: true },
      },
    },
  })

  // Aggregate plan counts
  const summary: Record<string, number> = {}

  for (const emp of employees) {
    if (emp.user && emp.user.plans?.length) {
      for (const plan of emp.user.plans) {
        summary[plan.planName] = (summary[plan.planName] || 0) + 1
      }
    } else {
      summary['Unassigned'] = (summary['Unassigned'] || 0) + 1
    }
  }

  return Object.entries(summary).map(([planName, count]) => ({
    planName,
    count,
  }))
})
