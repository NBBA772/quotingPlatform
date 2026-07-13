import prisma from "~/server/database/client";
import { defineEventHandler, getQuery } from "h3";

/**
 * @swagger
 * /api/employee/{id}/insurance-cards:
 *   get:
 *     summary: Get insurance cards for an employee's linked user
 *     description: Retrieves all insurance, dental, and vision cards for the employee's linked user.
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
 *         description: Successfully retrieved insurance cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insuranceCards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       relation:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       400:
 *         description: Invalid employee ID
 *       404:
 *         description: Employee or linked user not found
 *       500:
 *         description: Failed to fetch insurance cards
 */

export default defineEventHandler(async (event) => {
  const employeeId = Number(event.context.params?.id || getQuery(event).id);
  if (!employeeId) {
    console.log("DEBUG: No employee ID provided");
    return { error: "Employee ID is required" };
  }

  try {
    console.log(`DEBUG: Fetching insurance cards for employee id=${employeeId}`);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          include: {
            insuranceCards: true, // fetch all insurance cards
          },
        },
      },
    });

    if (!employee) return { error: "Employee not found" };
    if (!employee.user) return { error: "Employee has no linked user" };

    // Return the array of insurance cards
    return {
      insuranceCards: employee.user.insuranceCards || [],
    };
  } catch (err) {
    console.error("DEBUG: Error fetching insurance cards:", err);
    return { error: "Failed to fetch insurance cards" };
  }
});
