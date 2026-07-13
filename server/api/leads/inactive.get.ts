import prisma from "~/server/database/client"
import { getHeader, createError } from "h3"
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository"

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
  if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  // fetch only inactive leads belonging to this agent
  return await prisma.lead.findMany({
    where: {
      agentId: user.id,
      deletedAt: { not: null } // soft-deleted leads
    },
    orderBy: { id: "desc" }
  })
})
