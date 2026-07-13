/**
 * @swagger
 * /api/employee/{id}/claim-support:
 *   get:
 *     summary: Get claim supports for an employee's linked user
 *     description: >
 *       Retrieves all claim support records associated with the employee's linked user.
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
 *         description: Successfully retrieved claim supports
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
 *                 hasClaimsSupport:
 *                   type: boolean
 *                   example: true
 *                 claimSupports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       userId:
 *                         type: integer
 *                         example: 18
 *                       type:
 *                         type: string
 *                         example: "HMO"
 *                       paidAmount:
 *                         type: number
 *                         example: 520
 *                       maxCoverage:
 *                         type: number
 *                         example: 1000
 *                       phone:
 *                         type: string
 *                         example: "8635551122"
 *                       email:
 *                         type: string
 *                         example: "hmo@businessbenefitalliance.com"
 *                       portalUrl:
 *                         type: string
 *                         example: "www.hmoportal.com"
 *                       officeHours:
 *                         type: string
 *                         example: "8:00 AM – 5:00 PM"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-27T17:48:51.988Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-27T17:48:51.988Z"
 *       400:
 *         description: Invalid employee ID
 *       404:
 *         description: Employee or linked user not found
 *       500:
 *         description: Failed to fetch claim supports
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
    console.log(`DEBUG: Fetching claim support for employee id=${employeeId}`);

    // Fetch the employee and linked user with claim supports
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          include: {
            claimSupports: true,
          },
        },
      },
    });

    if (!employee) return { error: "Employee not found" };
    if (!employee.user) return { error: "Employee has no linked user" };

    const claims = employee.user.claimSupports || [];

    const response = {
      employeeId: employee.id,
      userId: employee.user.id,
      hasClaimsSupport: claims.length > 0,
      claimSupports: claims,
    };

    console.log("DEBUG: Response object:", response);
    return response;
  } catch (err) {
    console.error("DEBUG: Error fetching claim support:", err);
    return { error: "Failed to fetch claim support" };
  }
});
