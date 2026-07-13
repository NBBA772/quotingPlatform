// server/api/companies/assigned.ts
import prisma from '~/server/database/client'
import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const agentId = query.agentId ? Number(query.agentId) : undefined

    if (!agentId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Agent not logged in' })
    }

    const companies = await prisma.company.findMany({
      where: { agentId },
      include: {
        agent: { select: { id: true, firstName: true, lastName: true, email: true } },
        employees: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { assigned: companies }
  } catch (error: any) {
    console.error('❌ Error fetching companies:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message,
    })
  }
})
