/**
 * @swagger
 * /api/insurance-agent/agents-csv:
 *   get:
 *     summary: Export all insurance agents as CSV
 *     description: >
 *       Generates a CSV file containing all insurance agents (active and deleted) for the authenticated AppAdmin. 
 *       Requires a valid auth token.
 *     tags:
 *       - Insurance Agent
 *     security:
 *       - cookieAuth: []  
 *     responses:
 *       200:
 *         description: CSV file containing insurance agents
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
 *                   example: "Unauthorized or no AppAdmin found"
 *       500:
 *         description: Failed to export agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to export agents"
 */

import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";
import { defineEventHandler, getCookie, send } from "h3";

// Get current user from auth token/session
async function getCurrentUser(event: any) {
  const authToken = getCookie(event, "auth_token");
  if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });

  const user = await getUserByAuthToken(authToken);
  if (!user) return null;

  return user;
}

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event);

    // Ensure user is an AppAdmin
    if (!user || !user.appAdminId) {
      console.error("User missing or not an AppAdmin");
      return send(event, "Unauthorized or no AppAdmin found", 401);
    }

    // Fetch all insurance agents under this AppAdmin
    const agents = await prisma.appAdmin.findMany({
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

    agents.forEach((agent) => {
      csvRows.push(
        [
          agent.id,
          `"${agent.firstName}"`,
          `"${agent.lastName}"`,
          agent.email,
          agent.isActive ? "active" : "deleted",
          agent.createdAt.toISOString(),
        ].join(",")
      );
    });

    const csv = csvRows.join("\n");

    event.res.setHeader("Content-Type", "text/csv");
    event.res.setHeader("Content-Disposition", `attachment; filename="agents.csv"`);
    return csv;
  } catch (err) {
    console.error("Error exporting agents CSV:", err);
    return send(event, "Failed to export agents", 500);
  }
});
