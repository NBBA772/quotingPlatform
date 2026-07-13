// server/api/insurance-agent/[id]/restore.patch.ts
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  if (!id) throw createError({ statusCode: 400, statusMessage: "Agent ID is required" });

  try {
    const restoredAgent = await prisma.appAdmin.update({
      where: { id: id },
      data: { isActive: true }, // restore
    });
    return restoredAgent;
  } catch (err) {
    console.error(`Error restoring agent ${id}:`, err);
    throw createError({ statusCode: 500, statusMessage: "Failed to restore agent" });
  }
});
