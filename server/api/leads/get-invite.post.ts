import prisma from "~/server/database/client"
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;

  if (!email) throw createError({ statusCode: 400, message: "Email required" });

  const invite = await prisma.leadInvite.findFirst({
    where: { email, acceptedAt: null },
    select: { id: true, agentId: true } // <-- include agentId
  });

  if (!invite) throw createError({ statusCode: 404, message: "No active invite found" });

  return invite; // now returns { id, agentId }
});
