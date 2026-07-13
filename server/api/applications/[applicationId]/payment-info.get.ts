import { createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser, assertCanManageApplication, getApplicationOrThrow } from '~/server/utils/enrollmentAuth'
import { epayConfigured, epayFetch } from '~/server/utils/epaypolicy'
import { ONE_TIME_ENROLLMENT_FEE } from '~/utils/enrollmentFee'

// Returns the amount due (computed server-side from the application's
// selections) and the credit-card payer fee quoted by ePayPolicy.
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const applicationId = Number((event.context.params as any).applicationId)
    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application id' })
    }

    const app = await getApplicationOrThrow(applicationId)
    await assertCanManageApplication(user, app.userId)

    if (!app.signedAt) {
      throw createError({ statusCode: 400, statusMessage: 'Application must be signed before payment' })
    }
    const manualMode = process.env.EPAYPOLICY_MANUAL_MODE === 'true' || !epayConfigured()

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

    // One-time enrollment fee applies to the first payment unless waived
    const priorPayment = await prisma.payment.findFirst({
      where: { applicationId: app.id, status: { in: ['succeeded', 'authorized'] } },
    })
    if (!priorPayment && app.waiveOneTimeFee !== true) {
      breakdown.push({ label: 'One-time enrollment fee', amount: ONE_TIME_ENROLLMENT_FEE, oneTime: true })
    }

    const amount = Number(breakdown.reduce((sum, item) => sum + item.amount, 0).toFixed(2))
    if (amount <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'No priced coverage on this application' })
    }

    // Quote payer fees for both methods so the client sees full charges up
    // front (skipped in manual mode — no API access yet)
    let creditCardPayerFee: number | null = null
    let achPayerFee: number | null = null
    try {
      if (manualMode) throw new Error('manual mode')
      const feeRes = await epayFetch('/api/v1/transactionFees', { query: { amount: amount.toFixed(2) } })
      if (feeRes.ok) {
        if (feeRes.data?.creditCardPayerFee != null) creditCardPayerFee = Number(feeRes.data.creditCardPayerFee)
        if (feeRes.data?.achPayerFee != null) achPayerFee = Number(feeRes.data.achPayerFee)
      }
    } catch (err) {
      console.error('Fee quote failed (continuing without):', err)
    }

    // "Paid" for UI purposes means paid or authorized (manual) this period
    const recentPayment = await prisma.payment.findFirst({
      where: {
        applicationId: app.id,
        status: { in: ['succeeded', 'authorized'] },
        createdAt: { gte: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      },
    })
    const alreadyPaid = !!recentPayment

    return {
      amount,
      breakdown,
      creditCardPayerFee,
      achPayerFee,
      cardTotal: creditCardPayerFee != null ? Number((amount + creditCardPayerFee).toFixed(2)) : amount,
      achTotal: achPayerFee != null ? Number((amount + achPayerFee).toFixed(2)) : amount,
      invoice: `APP-${app.id}${app.groupNumber ? `-${app.groupNumber}` : ''}`,
      alreadyPaid,
      manualMode,
    }
  } catch (err: any) {
    console.error('❌ Payment info error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to load payment info',
    })
  }
})
