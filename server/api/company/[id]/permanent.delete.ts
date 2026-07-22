import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'
import { purgeCompany } from '~/server/utils/hardDelete'

// Permanently deletes a company/household and everyone + everything under it.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid company id' })

  const company = await prisma.company.findUnique({ where: { id }, select: { id: true } })
  if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })

  await prisma.$transaction(async (tx) => {
    await purgeCompany(tx, id)
  }, { timeout: 60000 })

  return { success: true }
})
