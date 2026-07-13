// server/api/company/web-development-requests.get.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    // 🔑 Auth handling
    let authToken = getCookie(event, 'auth_token')
    if (!authToken) {
      const authHeader = event.req.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        authToken = authHeader.replace('Bearer ', '')
      }
    }
    if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized: No auth token' })

    // 🔑 Session lookup
    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { companyAdmin: true, user: true },
    })
    if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const companyId = session.user?.companyId || session.companyAdmin?.companyId
    if (!companyId) {
      throw createError({ statusCode: 403, message: 'Forbidden: Must belong to a company' })
    }

    // ✅ Fetch Web Dev requests
    const requests = await prisma.webDevelopmentRequest.findMany({
      where: { companyId },
      orderBy: { requestedAt: 'desc' },
    })

    return { requests }
  } catch (err: any) {
    console.error('🚨 Error in /api/company/web-development-requests:', err) // log full error
    throw createError({
      statusCode: 500,
      message: 'Internal Server Error: ' + (err.message || 'Unknown error'),
    })
  }
})
