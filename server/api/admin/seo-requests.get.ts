import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const companyId = Number(getQuery(event).companyId)
  if (!companyId) throw createError({ statusCode: 400, message: 'companyId is required' })

  const requests = await prisma.sEORequest.findMany({
    where: { companyId },
    orderBy: { requestedAt: 'desc' },
  })

  return { requests }
})
