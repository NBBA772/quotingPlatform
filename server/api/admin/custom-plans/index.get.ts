import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin: list a company's custom plans (active only), with benefits.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const companyId = Number(getQuery(event).companyId)
  if (isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'companyId is required' })
  }

  const plans = await prisma.customPlan.findMany({
    where: { companyId, isActive: true },
    include: { benefits: true },
    orderBy: { createdAt: 'asc' },
  })

  return { plans }
})
