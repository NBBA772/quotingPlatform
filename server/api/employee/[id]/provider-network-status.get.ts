/**
 * @swagger
 * /api/employee/{id}/provider-network-status:
 *   get:
 *     summary: Get provider network status for an employee
 *     description: >
 *       Returns whether the employee's linked user has provider networks and the list of networks.
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
 *         description: Successfully retrieved provider network status
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
 *                 hasProviderNetwork:
 *                   type: boolean
 *                   example: true
 *                 providerNetworks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Blue Cross Network"
 *                       type:
 *                         type: string
 *                         example: "PPO"
 *                       contactPhone:
 *                         type: string
 *                         example: "+1-555-123-4567"
 *                       contactEmail:
 *                         type: string
 *                         example: "network@example.com"
 *       400:
 *         description: Invalid employee ID
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to fetch provider network
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
    console.log(`DEBUG: Fetching employee with id=${employeeId}`);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          include: {
            providers: true,
          },
        },
      },
    });

    if (!employee) return { error: "Employee not found" };
    if (!employee.user) return { error: "Employee has no linked user" };

    const networks = employee.user.providers || [];

    const response = {
      employeeId: employee.id,
      userId: employee.user.id,
      hasProviderNetwork: networks.length > 0,
      providerNetworks: networks,
    };

    console.log("DEBUG: Response object:", response);
    return response;
  } catch (err) {
    console.error("DEBUG: Error fetching provider network:", err);
    return { error: "Failed to fetch provider network" };
  }
});
