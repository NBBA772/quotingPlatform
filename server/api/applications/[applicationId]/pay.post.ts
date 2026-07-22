import crypto from 'crypto'
import { readBody, createError } from 'h3'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import prisma from '~/server/database/client'
import { requireAuthUser, assertCanManageApplication, getApplicationOrThrow } from '~/server/utils/enrollmentAuth'
import { epayConfigured, epayFetch } from '~/server/utils/epaypolicy'
import { buildPaymentAuthPdf } from '~/server/utils/paymentAuthPdf'
import { logPaymentToSheet } from '~/server/utils/googleSheets'
import { ONE_TIME_ENROLLMENT_FEE } from '~/utils/enrollmentFee'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.AWS_S3_BUCKET!

// Charges the application total via ePayPolicy (POST /api/v1/transactions).
// Card details pass straight through to ePayPolicy and are never stored or
// logged. The amount is always computed server-side from the application.
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const applicationId = Number((event.context.params as any).applicationId)
    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application id' })
    }

    const app = await getApplicationOrThrow(applicationId)
    await assertCanManageApplication(user, app.userId)

    // Block double-charges within a billing period, but allow the next
    // month's premium to be collected on an already-paid application.
    const recentPayment = await prisma.payment.findFirst({
      where: {
        applicationId: app.id,
        status: { in: ['succeeded', 'authorized'] },
        createdAt: { gte: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      },
    })
    if (recentPayment) {
      throw createError({ statusCode: 400, statusMessage: 'This application was already paid this billing period' })
    }

    // Manual mode: record a payment-authorization PDF for the office to
    // process by hand (used while ePayPolicy API access is pending)
    const manualMode = process.env.EPAYPOLICY_MANUAL_MODE === 'true' || !epayConfigured()

    const body = await readBody(event)
    const method: 'card' | 'ach' = body?.method === 'ach' ? 'ach' : 'card'

    let paymentInformation: Record<string, any>
    if (method === 'ach') {
      const bank = body?.bank || {}
      for (const field of ['accountHolder', 'accountType', 'routingNumber', 'accountNumber']) {
        if (!String(bank[field] ?? '').trim()) {
          throw createError({ statusCode: 400, statusMessage: `Missing bank field: ${field}` })
        }
      }
      const accountTypes = ['PersonalChecking', 'PersonalSavings', 'CorporateChecking', 'CorporateSavings']
      if (!accountTypes.includes(bank.accountType)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid account type' })
      }
      paymentInformation = {
        bankAccountInformation: {
          accountHolder: String(bank.accountHolder).trim(),
          accountType: bank.accountType,
          routingNumber: String(bank.routingNumber).replace(/\D/g, ''),
          accountNumber: String(bank.accountNumber).replace(/\D/g, ''),
        },
      }
    } else {
      const card = body?.card || {}
      for (const field of ['accountHolder', 'cardNumber', 'cvc', 'month', 'year']) {
        if (!String(card[field] ?? '').trim()) {
          throw createError({ statusCode: 400, statusMessage: `Missing card field: ${field}` })
        }
      }
      paymentInformation = {
        creditCardInformation: {
          accountHolder: String(card.accountHolder).trim(),
          cardNumber: String(card.cardNumber).replace(/\s|-/g, ''),
          cvc: String(card.cvc).trim(),
          month: Number(card.month),
          year: Number(card.year),
          postalCode: card.postalCode ? String(card.postalCode).trim() : undefined,
        },
      }
    }

    // Amount comes from the application, never from the client
    let amount = 0
    if (app.healthPlanPrice != null) amount += app.healthPlanPrice
    if (app.visionAndDentalPlan && app.visionAndDentalPrice != null) amount += app.visionAndDentalPrice
    for (const plan of app.ancillaryPlans) {
      if (plan.price != null) amount += plan.price
    }

    // One-time enrollment fee on the first payment unless waived
    const priorPayment = await prisma.payment.findFirst({
      where: { applicationId: app.id, status: { in: ['succeeded', 'authorized'] } },
    })
    const chargeEnrollmentFee = !priorPayment && app.waiveOneTimeFee !== true
    if (chargeEnrollmentFee) amount += ONE_TIME_ENROLLMENT_FEE

    amount = Number(amount.toFixed(2))
    if (app.healthPlanPrice == null || amount <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Your agent must complete plan selection before payment' })
    }

    const payer = [app.firstName, app.lastName].filter(Boolean).join(' ') || 'Applicant'
    const emailAddress = app.email || app.user?.email
    if (!emailAddress) {
      throw createError({ statusCode: 400, statusMessage: 'Applicant has no email for the receipt' })
    }

    const invoice = `APP-${app.id}${app.groupNumber ? `-${app.groupNumber}` : ''}`

    const ipAddr = String(
      event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress || 'unknown',
    )

    if (manualMode) {
      const breakdown: { label: string; amount: number; oneTime?: boolean }[] = []
      if (app.healthPlanPrice != null) {
        breakdown.push({ label: `Health Plan (${app.healthPlan || 'selected'})`, amount: app.healthPlanPrice })
      }
      if (app.visionAndDentalPlan && app.visionAndDentalPrice != null) {
        breakdown.push({ label: 'Dental & Vision', amount: app.visionAndDentalPrice })
      }
      for (const plan of app.ancillaryPlans) {
        if (plan.price != null) {
          breakdown.push({ label: `${plan.product || plan.planName || 'Ancillary'}`, amount: plan.price })
        }
      }
      if (chargeEnrollmentFee) {
        breakdown.push({ label: 'One-time enrollment fee', amount: ONE_TIME_ENROLLMENT_FEE, oneTime: true })
      }

      const pdfBytes = await buildPaymentAuthPdf({
        invoice,
        application: app,
        breakdown,
        amount,
        method,
        card: method === 'card'
          ? {
              accountHolder: String(body.card.accountHolder).trim(),
              cardNumber: String(body.card.cardNumber).replace(/\s|-/g, ''),
              cvc: String(body.card.cvc).trim(),
              month: Number(body.card.month),
              year: Number(body.card.year),
              postalCode: body.card.postalCode ? String(body.card.postalCode).trim() : undefined,
            }
          : undefined,
        bank: method === 'ach'
          ? {
              accountHolder: String(body.bank.accountHolder).trim(),
              accountType: body.bank.accountType,
              routingNumber: String(body.bank.routingNumber).replace(/\D/g, ''),
              accountNumber: String(body.bank.accountNumber).replace(/\D/g, ''),
            }
          : undefined,
        ip: ipAddr,
      })

      const fileKey = `payment-authorizations/${app.id}-${Date.now()}.pdf`
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        Body: Buffer.from(pdfBytes),
        ContentType: 'application/pdf',
      }))
      const pdfUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileKey}`

      const payment = await prisma.payment.create({
        data: {
          applicationId: app.id,
          amount,
          method,
          status: 'authorized', // pending manual processing by the office
          invoice,
          pdfUrl,
        },
      })

      await prisma.auditTrail.create({
        data: {
          userId: user.id,
          insuranceApplicationId: app.id,
          ip: ipAddr,
          signer: payer,
          email: emailAddress,
          documentHash: crypto.createHash('sha256').update(Buffer.from(pdfBytes)).digest('hex'),
          action: method === 'ach' ? 'Payment authorization (ACH, manual)' : 'Payment authorization (card, manual)',
          metadata: { paymentId: payment.id, amount, invoice, method, manual: true },
        },
      })

      // Record the payment in Google Sheets (best-effort).
      await logPaymentToSheet(app, { amount, method, status: 'authorized', invoice })

      return { success: true, manual: true, paymentId: payment.id, amount }
    }

    const res = await epayFetch('/api/v1/transactions', {
      method: 'POST',
      body: {
        amount,
        payer,
        emailAddress,
        sendReceipt: true,
        comments: `Insurance enrollment ${invoice}`,
        ...paymentInformation,
        attributeValues: { invoice },
      },
    })

    // Auth failures are configuration problems, not declines — surface them
    // clearly and don't record them as declined payments.
    if (res.status === 401 || res.status === 403) {
      console.error('ePayPolicy rejected API credentials:', res.status)
      throw createError({
        statusCode: 502,
        statusMessage: 'Payment system configuration error: ePayPolicy rejected the API credentials. Check that EPAYPOLICY_API_KEY/SECRET match the environment in EPAYPOLICY_API_URL (sandbox keys for sandbox, production keys for production).',
      })
    }

    const responseCode = res.data?.paymentResponseCode
    if (!res.ok || (responseCode && responseCode !== 'Success')) {
      const message = res.data?.message || (typeof res.data === 'string' ? res.data : null) || 'Payment was declined'
      console.error('ePayPolicy transaction failed:', res.status, res.data)
      // Record the decline for the admin payments dashboard
      await prisma.payment.create({
        data: {
          applicationId: app.id,
          amount,
          method,
          status: 'declined',
          message: String(message).slice(0, 500),
          invoice,
        },
      }).catch((e) => console.error('Failed to record declined payment:', e))
      throw createError({ statusCode: 402, statusMessage: message })
    }

    const transactionId = res.data?.id ?? null

    await prisma.payment.create({
      data: {
        applicationId: app.id,
        amount,
        method,
        status: 'succeeded',
        transactionId: transactionId != null ? String(transactionId) : null,
        invoice,
      },
    }).catch((e) => console.error('Failed to record payment:', e))

    await prisma.insuranceApplication.update({
      where: { id: app.id },
      data: { status: 'paid' },
    })

    await prisma.auditTrail.create({
      data: {
        userId: user.id,
        insuranceApplicationId: app.id,
        ip: ipAddr,
        signer: payer,
        email: emailAddress,
        documentHash: '',
        action: method === 'ach' ? 'Payment (ePayPolicy ACH)' : 'Payment (ePayPolicy credit card)',
        metadata: { transactionId, amount, invoice, method },
      },
    })

    // Record the payment in Google Sheets (best-effort).
    await logPaymentToSheet(app, {
      amount,
      method,
      status: 'succeeded',
      transactionId: transactionId != null ? String(transactionId) : null,
      invoice,
    })

    return { success: true, transactionId, amount }
  } catch (err: any) {
    console.error('❌ Payment error:', err.statusMessage || err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Payment failed',
    })
  }
})
