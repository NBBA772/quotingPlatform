import crypto from 'crypto'
import { readBody, createError } from 'h3'
import { Resend } from 'resend'
import twilio from 'twilio'
import prisma from '~/server/database/client'

const CODE_TTL_MINUTES = 10
const MAX_CODES_PER_WINDOW = 5

// Public endpoint: sends the signing code to the contact info the AGENT put on
// file — never to an address supplied by the caller — so possession of the
// email inbox / phone is what's being verified.
export default defineEventHandler(async (event) => {
  try {
    const token = String((event.context.params as any).token || '')
    if (!/^[a-f0-9]{64}$/.test(token)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid review link' })
    }

    const agreement = await prisma.companyAgreement.findUnique({
      where: { reviewToken: token },
      include: { company: true },
    })
    if (!agreement) {
      throw createError({ statusCode: 404, statusMessage: 'This review link is invalid or has been removed' })
    }
    if (agreement.status === 'signed') {
      throw createError({ statusCode: 400, statusMessage: 'This agreement is already signed' })
    }

    const body = await readBody(event)
    const channel: 'email' | 'sms' = body.channel === 'sms' ? 'sms' : 'email'
    const sentTo = channel === 'sms' ? agreement.contactPhone : agreement.contactEmail
    if (!sentTo) {
      throw createError({ statusCode: 400, statusMessage: 'No phone number on file — use the email option' })
    }

    const windowStart = new Date(Date.now() - 15 * 60 * 1000)
    const recent = await prisma.signatureCode.count({
      where: { companyAgreementId: agreement.id, createdAt: { gte: windowStart } },
    })
    if (recent >= MAX_CODES_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many codes requested. Try again in a few minutes.' })
    }

    const code = crypto.randomInt(100000, 1000000).toString()
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')

    await prisma.signatureCode.updateMany({
      where: { companyAgreementId: agreement.id, usedAt: null },
      data: { expiresAt: new Date() },
    })

    await prisma.signatureCode.create({
      data: {
        companyAgreementId: agreement.id,
        codeHash,
        channel,
        sentTo,
        expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      },
    })

    const messageText = `Your signing code for the ${agreement.company.companyName} agreement is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`

    if (channel === 'sms') {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
      await client.messages.create({
        to: sentTo,
        from: process.env.TWILIO_PHONE_NUMBER!,
        body: messageText,
      })
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { error } = await resend.emails.send({
        from: 'noreply@updates.businessbenefitalliance.com',
        to: sentTo,
        subject: 'Your signing code',
        html: `
          <p>Hello ${agreement.contactFirstName},</p>
          <p>Use this code to sign the <b>${agreement.company.companyName}</b> agreement:</p>
          <p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${code}</p>
          <p>The code expires in ${CODE_TTL_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
        `,
      })
      if (error) {
        console.error('Resend error:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to send code email' })
      }
    }

    const masked = channel === 'sms'
      ? sentTo.replace(/\d(?=\d{4})/g, '•')
      : sentTo.replace(/^(.).*(@.*)$/, '$1•••$2')

    return { success: true, channel, sentTo: masked, expiresInMinutes: CODE_TTL_MINUTES }
  } catch (err: any) {
    console.error('❌ Agreement send-code error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to send signing code',
    })
  }
})
