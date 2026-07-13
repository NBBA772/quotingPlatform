/**
 * @swagger
 * /api/company/deleted-employees:
 *   get:
 *     summary: Get all soft-deleted employees
 *     description: >
 *       Fetches a list of employees that have been soft-deleted (deletedAt is not null), 
 *       including their ID, full name, and deletion date. Ordered by most recently deleted.
 *     tags:
 *       - Company
 *     responses:
 *       200:
 *         description: List of deleted employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   employeeId:
 *                     type: integer
 *                     example: 5
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   deletedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-01T15:44:11.328Z"
 *       500:
 *         description: Failed to fetch deleted employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch deleted employees"
 */

import prisma from "~/server/database/client";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  try {
    // Fetch all employees with deletedAt != null
    const deletedEmployees = await prisma.employee.findMany({
      where: { deletedAt: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        deletedAt: true,
      },
      orderBy: { deletedAt: "desc" },
    });

    return deletedEmployees.map(emp => ({
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      deletedAt: emp.deletedAt,
    }));
  } catch (err) {
    console.error("Error fetching deleted employees:", err);
    return { error: "Failed to fetch deleted employees" };
  }
});
