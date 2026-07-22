import { defineEventHandler } from 'h3'
import prisma from '~/server/database/client'
import { requireAgentAdmin } from '~/server/utils/enrollmentAuth'
import { commissionableForApplication } from '~/utils/enrollmentFee'

function monthlyTotal(app: any): number {
  let total = 0
  if (app.healthPlanPrice != null) total += app.healthPlanPrice
  if (app.visionAndDentalPlan && app.visionAndDentalPrice != null) total += app.visionAndDentalPrice
  for (const plan of app.ancillaryPlans || []) {
    if (plan.price != null) total += plan.price
  }
  return Number(total.toFixed(2))
}

// Aggregate book-of-business numbers across the agent manager's whole downline.
export default defineEventHandler(async (event) => {
  const agentAdmin = await requireAgentAdmin(event)

  const agents = await prisma.insuranceAgent.findMany({
    where: { agentAdminId: agentAdmin.id, deletedAt: null },
    select: { id: true },
  })
  const agentIds = agents.map((a) => a.id)

  // Every enrollee (company employee) under any downline agent.
  const companies = agentIds.length
    ? await prisma.company.findMany({
        where: { agentId: { in: agentIds } },
        select: { id: true, employees: { where: { isActive: true }, select: { userId: true } } },
      })
    : []

  const employeeUserIds = companies
    .flatMap((c) => c.employees.map((e) => e.userId))
    .filter((id): id is number => id != null)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [applications, paidMonthAgg] = await Promise.all([
    employeeUserIds.length
      ? prisma.insuranceApplication.findMany({
          where: { userId: { in: employeeUserIds } },
          select: {
            id: true,
            userId: true,
            status: true,
            signedAt: true,
            healthPlanPrice: true,
            visionAndDentalPlan: true,
            visionAndDentalPrice: true,
            ancillaryPlans: { select: { price: true } },
          },
        })
      : Promise.resolve([]),
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        createdAt: { gte: startOfMonth },
        application: { userId: { in: employeeUserIds.length ? employeeUserIds : [-1] } },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const signed = applications.filter((a) => !!a.signedAt || ['signed', 'paid'].includes(a.status || ''))
  const paid = applications.filter((a) => a.status === 'paid')
  const inProgress = applications.filter(
    (a) => !a.signedAt && ['draft', 'underwriting_complete', 'pdf_generated'].includes(a.status || 'draft'),
  )

  const book = paid.concat(signed.filter((a) => a.status !== 'paid'))
  const monthlyBook = Number(book.reduce((sum, a) => sum + monthlyTotal(a), 0).toFixed(2))
  const commissionable = Number(book.reduce((sum, a) => sum + commissionableForApplication(a), 0).toFixed(2))

  return {
    agents: agentIds.length,
    companies: companies.length,
    enrollees: employeeUserIds.length,
    applications: {
      total: applications.length,
      signed: signed.length,
      paid: paid.length,
      inProgress: inProgress.length,
    },
    monthlyBook,
    commissionable,
    paidThisMonth: {
      count: paidMonthAgg._count,
      total: Number((paidMonthAgg._sum.amount || 0).toFixed(2)),
    },
  }
})
