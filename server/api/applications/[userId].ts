import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params.userId)
  console.log('[DEBUG] Fetching application for userId:', userId)

  if (isNaN(userId)) {
    console.warn('[WARN] Invalid userId:', event.context.params.userId)
    throw createError({ statusCode: 400, statusMessage: 'Invalid userId' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    })

    if (!user) {
      console.warn('[WARN] No user found for userId:', userId)
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const bCode = user.company?.businessCode || null
        const application = await prisma.insuranceApplication.findFirst({
          where: {
            userId: userId,
          },
          include: {
            user: true,              // optional: include user info
            ancillaryPlans: true,    // ← correct relation name
            auditTrails: true,       // optional
            dependents: true,        // optional
          },
        });


    if (!application) {
      console.log('[DEBUG] No application found for userId:', userId)
      return null
    }

    console.log('[DEBUG] Fetched application:', application)
    return {application, bCode}

  } catch (err) {
    console.error('[ERROR] Fetching application failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
