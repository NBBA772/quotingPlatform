import prisma from "~/server/database/client"
import { getHeader, createError } from "h3"
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository"

export default defineEventHandler(async (event) => {
  const leadId = Number(event.context.params?.id)
  if (!leadId) throw createError({ statusCode: 400, message: "Lead ID is required" })

  const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
  if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  // Make sure the lead belongs to the logged-in agent
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead || lead.agentId !== user.id) {
    throw createError({ statusCode: 404, message: "Lead not found" })
  }

  // Restore the lead
  await prisma.lead.update({
    where: { id: leadId },
    data: { deletedAt: null }
  })

  return { success: true, message: "Lead restored successfully" }
})
