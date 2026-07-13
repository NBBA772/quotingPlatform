/**
 * @swagger
 * /api/employee/{id}/restore:
 *   patch:
 *     summary: Restore a deleted employee
 *     description: >
 *       Sets `isActive` to true and `deletedAt` to null for the given employee ID.
 *     tags:
 *       - Employee
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee to restore
 *     responses:
 *       200:
 *         description: Employee successfully restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                       example: true
 *                     deletedAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-27T17:48:51.988Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-31T14:30:00.000Z"
 *       400:
 *         description: Invalid employee ID
 *       500:
 *         description: Failed to restore employee
 */

import { defineEventHandler, getRouterParams } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  if (!id) {
    throw new Error("Employee ID is required");
  }

  try {
    const restored = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    return { success: true, employee: restored };
  } catch (err) {
    console.error("Error restoring employee:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to restore employee",
    });
  }
});
