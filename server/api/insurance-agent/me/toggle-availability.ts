// server/api/agents/me/toggle-availability.ts
import { defineEventHandler, getHeader, createError } from 'h3'
import prisma from '~/server/database/client'



export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) throw createError({ statusCode: 401, message: 'Missing auth token' })

    const token = authHeader.replace('Bearer ', '')
    const session = await prisma.session.findUnique({
      where: { authToken: token },
      include: { user: true }
    })
    if (!session?.user) throw createError({ statusCode: 401, message: 'Invalid session' })

    const userId = session.user.id

    // Find the agent
    const agent = await prisma.insuranceAgent.findFirst({
      where: { userId: session.user.id, deletedAt: null }
    });
    if (!agent) throw createError({ statusCode: 404, message: 'Agent not found for user' });



    if (!agent) {
      // Optionally: create a default agent if not exists
      agent = await prisma.insuranceAgent.create({
        data: {
          firstName: session.user.firstName || 'First',
          lastName: session.user.lastName || 'Last',
          email: session.user.email || `user${userId}@example.com`,
          password: 'TEMP_PASSWORD', // must be hashed in prod
          userId
        }
      })
    }

    // Toggle availability
    const updatedAgent = await prisma.insuranceAgent.update({
      where: { id: agent.id },
      data: { isAvailable: !agent.isAvailable }
    })


    return { success: true, isAvailable: updatedAgent.isAvailable }
  } catch (err: any) {
    console.error(err)
    throw createError({ statusCode: 500, message: err.message || 'internal server error' })
  }
})
