import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// Permanently deletes an enrollment-request (audit trail) row. Irreversible.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(event.context.params?.id)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  await prisma.auditTrail.delete({ where: { id } })
  return { success: true }
})
