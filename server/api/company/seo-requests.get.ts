import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  // Get auth token from cookie or Authorization header
  let authToken = getCookie(event, 'auth_token')
  if (!authToken) {
    const authHeader = event.req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.replace('Bearer ', '')
    }
  }

  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized: No auth token' })

  // Look up session
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { companyAdmin: true, user: true },
  })

  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // Determine companyId: either user.companyId or companyAdmin.companyId
  const companyId = session.user?.companyId || session.companyAdmin?.companyId
  if (!companyId) {
    throw createError({ statusCode: 403, message: 'Forbidden: Must belong to a company' })
  }

  // Fetch SEO requests
  const requests = await prisma.sEORequest.findMany({
    where: { companyId },
    orderBy: { requestedAt: 'desc' },
  })

  return { requests }
})
