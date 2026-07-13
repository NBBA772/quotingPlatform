import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import { getCookie, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getCookie(event, 'auth_token')
    if (!authToken) {
      throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
    }

    const user = await getUserByAuthToken(authToken)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })
    }

    const { applicationId } = event.context.params as { applicationId: string }
    const body = await readBody(event)
    const { signature } = body

    if (!signature) {
      throw createError({ statusCode: 400, statusMessage: 'Signature is required' })
    }

    // Find the application and verify it belongs to the user
    const application = await prisma.insuranceApplication.findUnique({
      where: { id: Number(applicationId) }
    })

    if (!application) {
      throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    }

    if (application.userId !== user.id) {
      throw createError({ statusCode: 403, statusMessage: 'You are not allowed to sign this application' })
    }

    // Update the application with the signature
    const updated = await prisma.insuranceApplication.update({
      where: { id: Number(applicationId) },
      data: { pdfUrl: signature }, // <-- use the `signature` from request body
    })

    return { success: true, application: updated }
  } catch (err: any) {
    console.error(err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to sign application' })
  }
})
