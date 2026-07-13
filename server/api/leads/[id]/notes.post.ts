import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  const leadId = parseInt(event.context.params!.id)
  const body = await readBody<{ content: string }>(event)

  const authToken = getCookie(event, "auth_token");
  const agent = await getUserByAuthToken(authToken);

  const note = await prisma.leadNote.create({
    data: {
      leadId,
      agentId: agent?.id,
      content: body.content,
    },
  })

  return { success: true, note }
})
