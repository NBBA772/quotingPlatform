/**
 * @swagger
 * /api/employee/{id}/plan-status:
 *   get:
 *     summary: Get plan benefits status for an employee
 *     description: >
 *       Returns whether the employee's linked user has plan benefits and basic employee info.
 *     tags:
 *       - Employee
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee
 *     responses:
 *       200:
 *         description: Successfully retrieved plan benefits status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employeeId:
 *                   type: integer
 *                   example: 15
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 planBenefitsStatus:
 *                   type: string
 *                   example: "Available"
 *                 hasPlanBenefits:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid employee ID
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to fetch plan benefits
 */

import prisma from "~/server/database/client";
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const employeeId = Number(event.context.params?.id || query.id);

  if (!employeeId) {
    return { error: "Employee ID is required" };
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: { include: { plans: true } } },
    });

    if (!employee) return { error: "Employee not found" };

    const hasPlanBenefits = employee.user?.plans?.length > 0;

    return {
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      planBenefitsStatus: hasPlanBenefits ? "Available" : "Missing",
      hasPlanBenefits,
    };
  } catch (err) {
    console.error("Error fetching plan benefits:", err);
    return { error: "Failed to fetch plan benefits" };
  }
});
