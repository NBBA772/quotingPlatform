import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) throw createError({ statusCode: 400, message: 'SEO request ID is required' })

  const body = await readBody(event)
  const companyId = body.companyId
  if (!companyId) throw createError({ statusCode: 400, message: 'companyId is required in body' })

  // Update only the request that matches the companyId
  const updated = await prisma.sEORequest.updateMany({
    where: { id, companyId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })

  if (updated.count === 0) {
    throw createError({ statusCode: 404, message: 'SEO request not found or does not belong to this company' })
  }

  return { success: true, updatedCount: updated.count }
})
