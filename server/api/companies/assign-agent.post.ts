import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { companyId, agentId } = body

    if (!companyId || !agentId) {
      throw createError({ statusCode: 400, statusMessage: "Missing companyId or agentId" })
    }

    const updated = await prisma.company.update({
      where: { id: Number(companyId) },
      data: { agentId: Number(agentId) },
    })

    return { success: true, updated }
  } catch (err) {
    console.error("Error assigning agent:", err)
    throw createError({ statusCode: 500, statusMessage: "Failed to assign agent" })
  }
})
