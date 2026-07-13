import { readBody, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser, assertCanManageApplication, getApplicationOrThrow } from '~/server/utils/enrollmentAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const applicationId = Number((event.context.params as any).applicationId)
    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application id' })
    }

    const application = await getApplicationOrThrow(applicationId)
    await assertCanManageApplication(user, application.userId)

    const body = await readBody(event)
    const { answers } = body
    if (!answers || typeof answers !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'Missing underwriting answers' })
    }

    const updated = await prisma.insuranceApplication.update({
      where: { id: applicationId },
      data: {
        underwritingAnswers: answers,
        status: 'underwriting_complete',
      },
    })

    return { success: true, application: updated }
  } catch (err: any) {
    console.error('❌ Save underwriting error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to save underwriting answers',
    })
  }
})
