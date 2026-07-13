// server/api/insurance-agent/company-registration-stats.get.ts
import { getCookie, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    // Get the agent's auth token
    const authToken = getCookie(event, "auth_token");
    if (!authToken) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

    // Get the session and user
    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    });
    if (!session?.user) throw createError({ statusCode: 401, statusMessage: "Invalid session" });

    const userId = session.user.id;

const invitedCount = await prisma.leadInvite.count({
  where: { agentId: userId },
});

const registeredCount = await prisma.leadInvite.count({
  where: {
    agentId: userId,
    acceptedAt: { not: null },
  },
});


    return { invitedCount, registeredCount };
  } catch (err: any) {
    console.error("Failed to fetch lead registration stats:", err);
    throw createError({ statusCode: 500, statusMessage: err?.message || "Failed to fetch stats" });
  }
});
