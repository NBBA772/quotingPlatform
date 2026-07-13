// server/api/insurance-agent/inActiveAgent.get.ts
import prisma from "~/server/database/client";

export default defineEventHandler(async () => {
  try {
    const inactiveAgents = await prisma.appAdmin.findMany({
      where: { isActive: false },
      orderBy: { createdAt: "desc" },
    });
    return inactiveAgents;
  } catch (err) {
    console.error("Error fetching inactive agents:", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch inactive agents" });
  }
});
