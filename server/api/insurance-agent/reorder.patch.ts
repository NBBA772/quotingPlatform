// server/api/insurance-agent/reorder.patch.ts
import prisma from "~/server/database/client";
import { defineEventHandler, readBody, getCookie, send } from "h3";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

// Get current user
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
    if (!user || !user.appAdminId) {
      return send(event, "Unauthorized or no AppAdmin found", 401);
    }

    const body = await readBody(event);
    const { order } = body; // expected: [{ id: 1, order: 0 }, { id: 2, order: 1 }, ...]

    if (!Array.isArray(order)) {
      return send(event, "Invalid request body", 400);
    }

    // Update each agent's order
    const updatePromises = order.map((agent: { id: number; order: number }) =>
      prisma.insuranceAgent.update({
        where: { id: agent.id },
        data: { order: agent.order },
      })
    );

    await Promise.all(updatePromises);

    return { success: true };
  } catch (err) {
    console.error("Error reordering agents:", err);
    return send(event, "Failed to reorder agents", 500);
  }
});
