import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin: soft-delete a custom plan (kept for any applications that
// already reference it; simply hidden from new selections and the manager).
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid plan id' })
  }

  await prisma.customPlan.update({ where: { id }, data: { isActive: false } })

  return { success: true }
})
