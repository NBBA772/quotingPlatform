import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  try {
    const agentId = getRouterParam(event, 'id')
    
    if (!agentId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Agent ID is required"
      })
    }

    // Update the agent's lastAssignedAt timestamp
    const updatedAgent = await prisma.insuranceAgent.update({
      where: { id: parseInt(agentId) },
      data: { lastAssignedAt: new Date() }
    })

    return { 
      status: "success", 
      message: "Agent assignment timestamp updated",
      agent: updatedAgent
    }
  } catch (err: any) {
    console.error("Failed to update agent assignment:", err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || "Failed to update agent assignment"
    })
  }
})