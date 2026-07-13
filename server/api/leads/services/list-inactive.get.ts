import prisma from "~/server/database/client"
import { getHeader, createError, defineEventHandler, getQuery } from "h3"
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository"

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization")
  if (!authHeader) throw createError({ statusCode: 401, message: "Unauthorized" })

  const authToken = authHeader.replace("Bearer ", "").trim()
  if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  // Get optional status filter from query parameters
  const query = getQuery(event)
  const status = query.status as string | undefined

  // Build Prisma "where" condition
  const where: any = {
    agentId: user.id,
    deletedAt: null,
  }

  if (status) {
    where.status = status
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { id: "desc" },
  })

  return { success: true, leads }
})
