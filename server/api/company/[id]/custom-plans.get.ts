import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

// Active custom plans for a company, for its employees to choose from.
export default defineEventHandler(async (event) => {
  await requireAuthUser(event)

  const companyId = Number(getRouterParam(event, 'id'))
  if (isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid company id' })
  }

  const plans = await prisma.customPlan.findMany({
    where: { companyId, isActive: true },
    include: { benefits: true },
    orderBy: { createdAt: 'asc' },
  })

  return { plans }
})
