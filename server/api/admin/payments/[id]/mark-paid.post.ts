import { readBody, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

// Marks a manually-processed payment authorization as completed.
export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  if (!user.appAdminId) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const id = Number((event.context.params as any).id)
  const payment = await prisma.payment.findUnique({ where: { id } })
  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }
  if (payment.status !== 'authorized') {
    throw createError({ statusCode: 400, statusMessage: 'Only pending manual payments can be marked paid' })
  }

  const body = await readBody(event).catch(() => ({}))
  const transactionId = body?.transactionId ? String(body.transactionId) : null

  const updated = await prisma.payment.update({
    where: { id },
    data: { status: 'succeeded', transactionId },
  })

  await prisma.insuranceApplication.update({
    where: { id: payment.applicationId },
    data: { status: 'paid' },
  })

  return { success: true, payment: updated }
})
