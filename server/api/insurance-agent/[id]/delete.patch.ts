// server/api/insurance-agent/[id]/delete.patch.ts
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  if (!id) throw createError({ statusCode: 400, statusMessage: "Agent ID is required" });

  try {
    const deletedAgent = await prisma.insuranceAgent.update({
      where: { id },
      data: { 
        isActive: false,           // soft delete flag
        deletedAt: new Date(),     // track deletion time
      },
    });
    return deletedAgent;
  } catch (err) {
    console.error(`Error soft-deleting agent ${id}:`, err);
    throw createError({ statusCode: 500, statusMessage: "Failed to soft-delete agent" });
  }
});
