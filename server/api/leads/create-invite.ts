import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, agentId, leadId = null, acceptedAt = null } = body;

    if (!email || !agentId) {
      throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
    }

    // Save invite in DB
    const invite = await prisma.leadInvite.create({
      data: {
        email,
        agentId,
        leadId,
        acceptedAt: acceptedAt ? new Date(acceptedAt) : null,
      },
    });

    return { success: true, invite };
  } catch (err) {
    console.error("Error creating lead invite:", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to create lead invite" });
  }
});
