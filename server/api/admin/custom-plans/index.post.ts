import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// Coerce "" / undefined to null, numbers to Float or null.
const num = (v: any) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))
const str = (v: any) => (v == null || String(v).trim() === '' ? null : String(v).trim())

// AppAdmin: create a custom plan for a company, with its benefit bullets.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const body = await readBody(event)
  const companyId = Number(body.companyId)
  if (isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'companyId is required' })
  }
  if (!body.name || !String(body.name).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Plan name is required' })
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  const benefits: string[] = Array.isArray(body.benefits)
    ? body.benefits.map((b: any) => String(b).trim()).filter(Boolean)
    : []

  const plan = await prisma.customPlan.create({
    data: {
      companyId,
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

  return { success: true, plan }
})
