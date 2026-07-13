import prisma from "~/server/database/client";
import { defineEventHandler, getCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    // Get session user
    const authToken = getCookie(event, "auth_token");
    if (!authToken) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    });

    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Invalid session" });
    }

    // Count invited agents
    const invitedCount = await prisma.insuranceAgentInvite.count({
      where: { invitedById: session.user.id },
    });

    // Count registered agents (linked to User + invite accepted)
    const registeredCount = await prisma.insuranceAgent.count({
      where: {
        user: { isActive: true },
        deletedAt: null,
      },
    });

    return {
      invitedCount,
      registeredCount,
    };
  } catch (err) {
    console.error("Error fetching insurance agent stats:", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch stats" });
  }
});
