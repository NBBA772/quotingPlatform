import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params.id)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  try {
    const trail = await prisma.auditTrail.update({
      where: { id },
      data: { deletedAt: new Date() }, // soft delete
    })

    return { success: true, trail }
  } catch (err) {
    console.error('[ERROR] Soft deleting audit trail failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
