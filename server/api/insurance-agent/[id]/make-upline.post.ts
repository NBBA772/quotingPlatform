import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin: promote an existing agent to also be an upline (agent manager).
// Creates an AgentAdmin from the agent's details and links their login, so the
// agent keeps their own book AND can be assigned a downline. Idempotent.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid agent id' })
  }

  const agent = await prisma.insuranceAgent.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!agent) throw createError({ statusCode: 404, statusMessage: 'Agent not found' })
  if (!agent.user) {
    throw createError({ statusCode: 400, statusMessage: 'This agent has no login to promote' })
  }

  // Already an upline — nothing to do.
  if (agent.user.agentAdminId) {
    return { success: true, alreadyUpline: true, agentAdminId: agent.user.agentAdminId }
  }

  try {
    const agentAdmin = await prisma.agentAdmin.create({
      data: {
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        username: agent.username,
        // Login goes through User.password; this copy just satisfies the schema.
        password: agent.user.password || agent.password,
      },
    })

    await prisma.user.update({
      where: { id: agent.user.id },
      data: { agentAdminId: agentAdmin.id },
    })

    return { success: true, alreadyUpline: false, agentAdminId: agentAdmin.id }
  } catch (err: any) {
    if (err?.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'A manager with this email or username already exists' })
    }
    throw err
  }
})
