import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

const num = (v: any) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))
const str = (v: any) => (v == null || String(v).trim() === '' ? null : String(v).trim())

// AppAdmin: update a custom plan and replace its benefit bullets.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid plan id' })
  }

  const body = await readBody(event)
  if (!body.name || !String(body.name).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Plan name is required' })
  }

  const benefits: string[] = Array.isArray(body.benefits)
    ? body.benefits.map((b: any) => String(b).trim()).filter(Boolean)
    : []

  // Replace benefits wholesale — simplest correct behaviour for an edit form.
  const plan = await prisma.$transaction(async (tx) => {
    await tx.customPlanBenefit.deleteMany({ where: { customPlanId: id } })
    return tx.customPlan.update({
      where: { id },
      data: {
        name: String(body.name).trim(),
        description: str(body.description),
        planType: str(body.planType),
        networkType: str(body.networkType),
        pdfUrl: str(body.pdfUrl),
        priceSingle: num(body.priceSingle),
        priceIndividualSpouse: num(body.priceIndividualSpouse),
        priceIndividualChild: num(body.priceIndividualChild),
        priceFamily: num(body.priceFamily),
        benefits: { create: benefits.map((text) => ({ text })) },
      },
      include: { benefits: true },
    })
  })

  return { success: true, plan }
})
