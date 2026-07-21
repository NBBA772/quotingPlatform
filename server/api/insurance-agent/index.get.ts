import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, "authorization")
  if (!auth) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

  const agents = await prisma.insuranceAgent.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { agentAdminId: true } } },
  })

  // Surface whether each agent is themselves an upline (manager).
  return agents.map((a) => ({ ...a, isUpline: !!a.user?.agentAdminId }))
})
