import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'
import { purgeUser } from '~/server/utils/hardDelete'

// Permanently deletes an app admin. Detaches agents it oversaw; purges its own
// admin login accounts (leaves any user that is also an agent). Cannot delete
// the admin you're currently signed in as.
export default defineEventHandler(async (event) => {
  const caller = await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid admin id' })
  if (caller.appAdminId === id) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot delete the admin you are signed in as' })
  }

  const admin = await prisma.appAdmin.findUnique({
    where: { id },
    include: { users: { select: { id: true, insuranceAgent: { select: { id: true } } } } },
  })
  if (!admin) throw createError({ statusCode: 404, statusMessage: 'Admin not found' })

  await prisma.$transaction(async (tx) => {
    // Agents were only "overseen by" this admin — keep them, drop the link.
    await tx.insuranceAgent.updateMany({ where: { appAdminId: id }, data: { appAdminId: null } })

    for (const u of admin.users) {
      if (u.insuranceAgent) {
        await tx.user.update({ where: { id: u.id }, data: { appAdminId: null } })
      } else {
        await purgeUser(tx, u.id)
      }
    }

    await tx.appAdmin.delete({ where: { id } })
  }, { timeout: 30000 })

  return { success: true }
})
