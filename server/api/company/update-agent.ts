import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  const { businessCode, agentId } = await readBody(event)
  const updated = await prisma.company.update({
    where: { businessCode },
    data: { agentId }
  })
  return { success: true }
})