/**
 * @swagger
 * /api/employee/inActiveEmployee:
 *   get:
 *     summary: Get all employees filtered by active status
 *     description: >
 *       Fetches all employees. You can filter by `isActive` query parameter to get either active or inactive employees.
 *     tags:
 *       - Employee
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Optional. Set to "true" to fetch only active employees, "false" for inactive employees. Omit to fetch all employees.
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 15
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Doe"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   isActive:
 *                     type: boolean
 *                     example: false
 *                   order:
 *                     type: integer
 *                     example: 1
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-08-27T17:48:51.988Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-08-27T17:48:51.988Z"
 *                   deletedAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: "2025-09-01T14:45:00.000Z"
 *       500:
 *         description: Failed to fetch employees
 */

import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    let isActive: boolean | undefined = undefined

    if (query.isActive === 'true') isActive = true
    if (query.isActive === 'false') isActive = false

    const employees = await prisma.employee.findMany({
      where: {
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { order: 'asc' }
    })

    return employees
  } catch (err) {
    console.error('Error fetching inactive employees:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch inactive employees' })
  }
})
