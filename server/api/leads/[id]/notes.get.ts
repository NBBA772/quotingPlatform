import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id);
    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid lead id" });
    }

    const notes = await prisma.leadNote.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });

    return { notes };
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch notes" });
  }
});
