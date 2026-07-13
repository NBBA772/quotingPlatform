import prisma from "~/server/database/client"
import { getHeader, createError } from "h3"

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, "authorization")
  if (!auth) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

  // find agent for logged-in user
  const token = auth.replace("Bearer ", "")
  const session = await prisma.session.findUnique({
    where: { authToken: token },
    include: { user: true }
  })
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: "Invalid session" })

  const agent = await prisma.insuranceAgent.findFirst({
    where: { userId: session.user.id, deletedAt: null }
  })

  if (!agent) throw createError({ statusCode: 404, statusMessage: "Agent not found" })

  return { success: true, agent }
})
