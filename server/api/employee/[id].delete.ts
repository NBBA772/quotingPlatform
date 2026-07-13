/**
 * @swagger
 * /api/employee/{id}:
 *   delete:
 *     summary: Soft delete an employee
 *     description: >
 *       Marks the employee as inactive and sets `deletedAt` to the current timestamp.
 *     tags:
 *       - Employee
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee to soft delete
 *     responses:
 *       200:
 *         description: Employee soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee soft deleted successfully"
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 15
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-01T14:45:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-27T17:48:51.988Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-01T14:45:00.000Z"
 *       400:
 *         description: Employee ID is required
 *       500:
 *         description: Failed to soft delete employee
 */

import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Employee ID is required',
    })
  }

  try {
    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(), 
        isActive: false,
      },
    })

    return {
      success: true,
      message: 'Employee soft deleted successfully',
      employee,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to soft delete employee',
    })
  }
})
