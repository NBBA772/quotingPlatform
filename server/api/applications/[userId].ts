import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params.userId)

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
    const company = user.company
      ? { id: user.company.id, enrollmentType: user.company.enrollmentType, companyName: user.company.companyName }
      : null
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
      return { application: null, bCode, company }
    }

    return {application, bCode, company}

  } catch (err) {
    console.error('[ERROR] Fetching application failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
