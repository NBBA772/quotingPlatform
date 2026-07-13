// server/api/admin/web-development-request.get.ts
import prisma from '~/server/database/client'
import { getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const companyId = Number(getQuery(event).companyId)

  if (!companyId) {
    throw createError({ statusCode: 400, message: 'companyId is required' })
  }

  try {
    const requests = await prisma.webDevelopmentRequest.findMany({
      where: { companyId },
      orderBy: { requestedAt: 'desc' },
    })

    return { requests }
  } catch (err) {
    console.error('Failed to fetch web development requests:', err)
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
