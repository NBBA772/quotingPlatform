/**
 * @swagger
 * /api/employee/{id}/plan-details:
 *   get:
 *     summary: Get plan details for an employee's linked user
 *     description: >
 *       Retrieves all plans and their associated benefits for the employee's linked user.
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
 *         description: Successfully retrieved plan details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employeeId:
 *                   type: integer
 *                   example: 15
 *                 userId:
 *                   type: integer
 *                   example: 18
 *                 hasPlanDetails:
 *                   type: boolean
 *                   example: true
 *                 planDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: "Premium PPO Plan"
 *                       type:
 *                         type: string
 *                         example: "PPO"
 *                       coverageStart:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-01T00:00:00.000Z"
 *                       coverageEnd:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-12-31T00:00:00.000Z"
 *                       networkType:
 *                         type: string
 *                         example: "In-Network"
 *                       benefits:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Annual Physical"
 *                             description:
 *                               type: string
 *                               example: "Covers one annual physical exam per year"
 *       400:
 *         description: Invalid employee ID
 *       404:
 *         description: Employee or linked user not found
 *       500:
 *         description: Failed to fetch plan details
 */

import prisma from "~/server/database/client";
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const employeeId = Number(event.context.params?.id || query.id);

  if (!employeeId) {
    console.log("DEBUG: No employee ID provided");
    return { error: "Employee ID is required" };
  }

  try {
    console.log(`DEBUG: Fetching plan details for employee id=${employeeId}`);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          include: {
            plans: {
              include: {
                benefits: true,
              },
            },
          },
        },
      },
    });

    if (!employee) return { error: "Employee not found" };
    if (!employee.user) return { error: "Employee has no linked user" };

    const plans = employee.user.plans || [];

    const response = {
      employeeId: employee.id,
      userId: employee.user.id,
      hasPlanDetails: plans.length > 0,
      planDetails: plans.map(plan => ({
        id: plan.id,
        name: plan.planName,
        type: plan.planType,
        coverageStart: plan.coverageStart,
        coverageEnd: plan.coverageEnd,
        networkType: plan.networkType,
        benefits: plan.benefits.map(b => ({ id: b.id, name: b.name, description: b.description })),
      })),
    };

    console.log("DEBUG: Plan details response:", response);
    return response;
  } catch (err) {
    console.error("DEBUG: Error fetching plan details:", err);
    return { error: "Failed to fetch plan details" };
  }
});
