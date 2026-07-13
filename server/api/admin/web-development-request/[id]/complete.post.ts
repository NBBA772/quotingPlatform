import prisma from '~/server/database/client'
import { getQuery, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params.id)
  if (!id) throw createError({ statusCode: 400, message: 'Request ID is required' })

  // Optional: validate companyId from body
  const body = await readBody(event)
  const companyId = Number(body?.companyId)
  if (!companyId) throw createError({ statusCode: 400, message: 'companyId is required' })

  try {
    // Update request status to COMPLETED
    const updatedRequest = await prisma.webDevelopmentRequest.updateMany({
      where: {
        id,
        companyId,
      },
      data: {
        status: 'COMPLETED',
      },
    })

    if (updatedRequest.count === 0) {
      throw createError({ statusCode: 404, message: 'Request not found or already completed' })
    }

    return { success: true }
  } catch (err: any) {
    console.error('Failed to mark request completed', err)
    throw createError({ statusCode: 500, message: 'Failed to mark request as completed' })
  }
})
