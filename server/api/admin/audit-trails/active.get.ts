// server/api/admin/audit-trails/active.get.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async () => {
  try {
    const trails = await prisma.auditTrail.findMany({
      where: { deletedAt: null }, // only active
      include: {
        user: true,
        insuranceApplication: true,
      },
      orderBy: { timestamp: 'desc' },
    })

    return { success: true, data: trails }
  } catch (err) {
    console.error('[ERROR] Fetch active audit trails failed:', err)
    return { success: false, error: 'Internal Server Error' }
  }
})
