import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'
import { purgeUser, cleanupOrphanAgentAdmin } from '~/server/utils/hardDelete'

// Permanently deletes an agent (and its login account + all owned data).
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid agent id' })

  const agent = await prisma.insuranceAgent.findUnique({
    where: { id },
    include: { user: { select: { id: true, agentAdminId: true } } },
  })
  if (!agent) throw createError({ statusCode: 404, statusMessage: 'Agent not found' })

  await prisma.$transaction(async (tx) => {
    if (agent.userId) {
      const managerId = agent.user?.agentAdminId ?? null
      await purgeUser(tx, agent.userId) // also removes the InsuranceAgent row
      if (managerId) await cleanupOrphanAgentAdmin(tx, managerId)
    } else {
      await tx.company.updateMany({ where: { agentId: agent.id }, data: { agentId: null } })
      await tx.companyAgreement.updateMany({ where: { agentId: agent.id }, data: { agentId: null } })
      await tx.insuranceAgent.delete({ where: { id: agent.id } })
    }
  }, { timeout: 30000 })

  return { success: true }
})
