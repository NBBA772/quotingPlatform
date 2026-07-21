import { defineEventHandler } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin: list agent managers (for the per-agent upline picker).
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const managers = await prisma.agentAdmin.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { firstName: 'asc' },
    select: { id: true, firstName: true, lastName: true, email: true },
  })

  return { managers }
})
