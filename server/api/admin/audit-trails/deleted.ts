// server/api/admin/audit-trails/deleted.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async () => {
  try {
    const trails = await prisma.auditTrail.findMany({
      where: { NOT: { deletedAt: null } }, // only deleted
      include: {
        user: true,
        insuranceApplication: true,
      },
      orderBy: { timestamp: 'desc' },
    })
    return { success: true, data: trails }
  } catch (err) {
    console.error('[ERROR] Fetch deleted audit trails failed:', err)
    return { success: false, error: 'Internal Server Error' }
  }
})
