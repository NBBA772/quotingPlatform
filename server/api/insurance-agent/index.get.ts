import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, "authorization")
  if (!auth) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

  return await prisma.insuranceAgent.findMany({
    orderBy: { createdAt: "desc" },
  })
})
