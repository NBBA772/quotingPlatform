import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin: set (or clear) an agent's upline / manager (AgentAdmin).
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid agent id' })
  }

  const body = await readBody(event)
  const agentAdminId =
    body.agentAdminId === null || body.agentAdminId === '' ? null : Number(body.agentAdminId)
  if (agentAdminId !== null && isNaN(agentAdminId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid manager id' })
  }

  if (agentAdminId !== null) {
    const manager = await prisma.agentAdmin.findUnique({ where: { id: agentAdminId } })
    if (!manager) throw createError({ statusCode: 404, statusMessage: 'Manager not found' })
  }

  const agent = await prisma.insuranceAgent.update({
    where: { id },
    data: { agentAdminId },
    select: { id: true, firstName: true, lastName: true, agentAdminId: true },
  })

  return { success: true, agent }
})
