// server/api/web-development-request.post.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Get auth token
  let authToken = getCookie(event, 'auth_token')
  if (!authToken) {
    const authHeader = event.req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.replace('Bearer ', '')
    }
  }

  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized: No auth token' })

  // Lookup session
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true, companyAdmin: true },
  })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // Determine companyId
  const companyId = session.user?.companyId || session.companyAdmin?.companyId
  if (!companyId) throw createError({ statusCode: 403, message: 'Forbidden: Must belong to a company' })

  const { projectName, description } = body
  if (!projectName) throw createError({ statusCode: 400, message: 'Project name is required' })

  const request = await prisma.webDevelopmentRequest.create({
    data: {
      companyId,
      projectName,
      description,
      status: 'PENDING'
    }
  })

  return { success: true, request }
})
