import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'
import { purgeUser } from '~/server/utils/hardDelete'

// Permanently deletes an agent manager (AgentAdmin). Detaches its downline;
// a dual-role user (also a producing agent) keeps their agent account and just
// loses the manager role; a pure-manager login is purged.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid manager id' })

  const manager = await prisma.agentAdmin.findUnique({
    where: { id },
    include: { users: { select: { id: true, insuranceAgent: { select: { id: true } } } } },
  })
  if (!manager) throw createError({ statusCode: 404, statusMessage: 'Manager not found' })

  await prisma.$transaction(async (tx) => {
    await tx.insuranceAgent.updateMany({ where: { agentAdminId: id }, data: { agentAdminId: null } })

    for (const u of manager.users) {
      if (u.insuranceAgent) {
        await tx.user.update({ where: { id: u.id }, data: { agentAdminId: null } })
      } else {
        await purgeUser(tx, u.id)
      }
    }

    await tx.agentAdmin.delete({ where: { id } })
  }, { timeout: 30000 })

  return { success: true }
})
