import type { H3Event } from 'h3'
import { getCookie, getHeader, createError } from 'h3'
import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

// Accepts either the auth_token cookie or an Authorization: Bearer header,
// matching the two patterns already used across the applications API.
export async function requireAuthUser(event: H3Event) {
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '')
  const authToken = bearer || getCookie(event, 'auth_token')
  if (!authToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
  }
  const user = await getUserByAuthToken(authToken)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })
  }
  return user
}

// Owner, app admin, company admin, or an insurance agent may work on an application.
export async function assertCanManageApplication(user: any, applicationUserId: number) {
  if (user.id === applicationUserId || user.appAdminId || user.companyAdminId) return
  const agent = await prisma.insuranceAgent.findUnique({ where: { userId: user.id } })
  if (agent) return
  throw createError({ statusCode: 403, statusMessage: 'Not authorized for this application' })
}

export async function getApplicationOrThrow(applicationId: number) {
  const application = await prisma.insuranceApplication.findUnique({
    where: { id: applicationId },
    include: { ancillaryPlans: true, dependents: true, user: true },
  })
  if (!application) {
    throw createError({ statusCode: 404, statusMessage: 'Application not found' })
  }
  return application
}
