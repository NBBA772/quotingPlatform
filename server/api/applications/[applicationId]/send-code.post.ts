import crypto from 'crypto'
import { createError } from 'h3'
import { Resend } from 'resend'
import prisma from '~/server/database/client'
import { requireAuthUser, assertCanManageApplication, getApplicationOrThrow } from '~/server/utils/enrollmentAuth'

const CODE_TTL_MINUTES = 10
const MAX_CODES_PER_WINDOW = 5

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const applicationId = Number((event.context.params as any).applicationId)
    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application id' })
    }

    const app = await getApplicationOrThrow(applicationId)
    await assertCanManageApplication(user, app.userId)

    // Codes are delivered by email only
    const sentTo = app.email || app.user?.email
    if (!sentTo) {
      throw createError({ statusCode: 400, statusMessage: 'Applicant has no email on file' })
    }

    // Basic rate limit so codes can't be spammed
    const windowStart = new Date(Date.now() - 15 * 60 * 1000)
    const recent = await prisma.signatureCode.count({
      where: { applicationId, createdAt: { gte: windowStart } },
    })
    if (recent >= MAX_CODES_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many codes requested. Try again in a few minutes.' })
    }

    const code = crypto.randomInt(100000, 1000000).toString()
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')

    // Invalidate older unused codes so only the latest one works
    await prisma.signatureCode.updateMany({
      where: { applicationId, usedAt: null },
      data: { expiresAt: new Date() },
    })

    await prisma.signatureCode.create({
      data: {
        applicationId,
        codeHash,
        channel: 'email',
        sentTo,
        expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      },
    })

    const applicantName = [app.firstName, app.lastName].filter(Boolean).join(' ') || 'Applicant'

    if (!process.env.RESEND_API_KEY) {
      throw createError({ statusCode: 501, statusMessage: 'Email is not configured — set the RESEND_API_KEY environment variable' })
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'noreply@updates.businessbenefitalliance.com',
      to: sentTo,
      subject: 'Your application signature code',
      html: `
        <p>Hello ${applicantName},</p>
        <p>Use this code to sign your insurance application:</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${code}</p>
        <p>The code expires in ${CODE_TTL_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
      `,
    })
    if (error) {
      console.error('Resend error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to send code email' })
    }

    // Mask the destination so the UI can show where the code went
    const masked = sentTo.replace(/^(.).*(@.*)$/, '$1•••$2')

    return { success: true, channel: 'email', sentTo: masked, expiresInMinutes: CODE_TTL_MINUTES }
  } catch (err: any) {
    console.error('❌ Send code error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to send signature code',
    })
  }
})
