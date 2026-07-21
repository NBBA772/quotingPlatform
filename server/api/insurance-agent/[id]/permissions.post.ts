import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin sets which enrollment modes an agent is allowed to work in.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid agent id' })
  }

  const body = await readBody(event)
  const data: Record<string, boolean> = {}
  for (const key of ['canIndividual', 'canGroup', 'canCustom'] as const) {
    if (typeof body[key] === 'boolean') data[key] = body[key]
  }
  if (Object.keys(data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No permission flags provided' })
  }

  const agent = await prisma.insuranceAgent.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      canIndividual: true,
      canGroup: true,
      canCustom: true,
    },
  })

  return { success: true, agent }
})
