// server/api/insurance-agent/[id]/delete.patch.ts
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const agentId = Number(event.context.params?.id);
  if (!agentId) throw createError({ statusCode: 400, statusMessage: "Agent ID is required" });

  try {
    const deletedAgent = await prisma.insuranceAgent.update({
      where: { id: agentId },
      data: { isActive: false }, // soft delete
    });
    return deletedAgent;
  } catch (err) {
    console.error(`Error soft-deleting agent ${agentId}:`, err);
    throw createError({ statusCode: 500, statusMessage: "Failed to soft-delete agent" });
  }
});
