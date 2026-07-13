// /server/api/insurance-agent/round-robin.get.ts
import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  try {
    // 1️⃣ Fetch all active insurance agents
    const agents = await prisma.insuranceAgent.findMany({
      where: { isActive: true },
      orderBy: { lastAssignedAt: "asc" } // pick the one least recently assigned
    });

    if (!agents.length) {
      return { status: "error", message: "No active agents available" };
    }

    // 2️⃣ Pick the first agent (round-robin logic)
    const agent = agents[0];

    // 3️⃣ Update the agent's lastAssignedAt timestamp
    await prisma.insuranceAgent.update({
      where: { id: agent.id },
      data: { lastAssignedAt: new Date() }
    });

    return { status: "success", agent };
  } catch (err: any) {
    console.error("Round-robin agent selection failed:", err);
    return createError({
      statusCode: 500,
      statusMessage: err?.message || "Internal server error"
    });
  }
});
