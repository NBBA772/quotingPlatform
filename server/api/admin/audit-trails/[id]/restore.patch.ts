import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params.id)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  try {
    const trail = await prisma.auditTrail.update({
      where: { id },
      data: { deletedAt: null }, // restore
    })

    return { success: true, trail }
  } catch (err) {
    console.error('[ERROR] Restoring audit trail failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
