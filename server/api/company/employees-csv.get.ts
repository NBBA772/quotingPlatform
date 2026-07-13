/**
 * @swagger
 * /api/company/employees-csv:
 *   get:
 *     summary: Export all company employees as CSV
 *     description: >
 *       Generates a CSV file containing all employees (active and deleted) for the authenticated user's company. 
 *       Requires a valid auth token.
 *     tags:
 *       - Company
 *     security:
 *       - cookieAuth: []   # Assuming auth_token is in cookie
 *     responses:
 *       200:
 *         description: CSV file containing employees
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: "ID,First Name,Last Name,Email,Status,Created At\n1,\"Jane\",\"Doe\",\"jane.doe@example.com\",active,2025-09-01T15:44:11.328Z"
 *       401:
 *         description: Unauthorized, missing or invalid auth token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized or no company found"
 *       500:
 *         description: Failed to export employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to export employees"
 */

import prisma from "~/server/database/client";
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository';
import { defineEventHandler, getHeader, send, getCookie } from "h3";



// Helper to get current user from auth token/session
async function getCurrentUser(event: any) {
    const authToken = getCookie(event, "auth_token")

    if (!authToken) {
        throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    // Get full user object from session repository
    const user = await getUserByAuthToken(authToken); // <-- returns user object
    if (!user) return null;

    return user; // no need to call prisma.user.findUnique again
}




export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event);
    console.log("Final user object:", user);

    if (!user || !user.companyId) {
      console.error("User missing or has no companyId");
      return send(event, "Unauthorized or no company found", 401);
    }

    // Fetch all employees (active + deleted) for the user's company
    const employees = await prisma.employee.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    // CSV Header
    const headers = ["ID", "First Name", "Last Name", "Email", "Status", "Created At"];
    const csvRows = [headers.join(",")];

    employees.forEach(emp => {
      csvRows.push([
        emp.id,
        `"${emp.firstName}"`,
        `"${emp.lastName}"`,
        emp.email,
        emp.isActive ? "active" : "deleted",
        emp.createdAt.toISOString()
      ].join(","));
    });

    const csv = csvRows.join("\n");

    event.res.setHeader("Content-Type", "text/csv");
    event.res.setHeader("Content-Disposition", `attachment; filename="employees.csv"`);
    return csv;
  } catch (err) {
    console.error(err);
    return send(event, "Failed to export employees", 500);
  }
});
