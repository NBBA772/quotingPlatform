import { createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

function monthlyTotal(app: any): number {
  let total = 0
  if (app.healthPlanPrice != null) total += app.healthPlanPrice
  if (app.visionAndDentalPlan && app.visionAndDentalPrice != null) total += app.visionAndDentalPrice
  for (const plan of app.ancillaryPlans || []) {
    if (plan.price != null) total += plan.price
  }
  return Number(total.toFixed(2))
}

// Book-of-business metrics for the logged-in insurance agent.
export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const agent = await prisma.insuranceAgent.findUnique({ where: { userId: user.id } })
  if (!agent) {
    throw createError({ statusCode: 403, statusMessage: 'Not an insurance agent' })
  }

  const companies = await prisma.company.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      companyName: true,
      employees: {
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, userId: true },
      },
    },
  })

  const employeeUserIds = companies
    .flatMap((c) => c.employees.map((e) => e.userId))
    .filter((id): id is number => id != null)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [applications, paidMonthAgg, declined, activeLeads] = await Promise.all([
    employeeUserIds.length
      ? prisma.insuranceApplication.findMany({
          where: { userId: { in: employeeUserIds } },
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            status: true,
            signedAt: true,
            healthPlanPrice: true,
            visionAndDentalPlan: true,
            visionAndDentalPrice: true,
            ancillaryPlans: { select: { price: true } },
            payments: {
              where: { status: 'succeeded' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { createdAt: true, amount: true },
            },
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
    prisma.payment.findMany({
      where: {
        status: 'declined',
        application: { userId: { in: employeeUserIds.length ? employeeUserIds : [-1] } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        application: { select: { userId: true, firstName: true, lastName: true, status: true } },
      },
    }),
    prisma.lead.count({
      where: { agentId: user.id, deletedAt: null, status: { not: 'closed' } },
    }),
  ])

  const appsByUserId = new Map(applications.map((a) => [a.userId, a]))

  const signed = applications.filter((a) => !!a.signedAt || ['signed', 'paid'].includes(a.status || ''))
  const paid = applications.filter((a) => a.status === 'paid')
  const inProgress = applications.filter(
    (a) => !a.signedAt && ['draft', 'underwriting_complete', 'pdf_generated'].includes(a.status || 'draft'),
  )

  const monthlyBook = Number(paid.concat(signed.filter((a) => a.status !== 'paid'))
    .reduce((sum, a) => sum + monthlyTotal(a), 0).toFixed(2))

  // Clients with no application started yet
  const notStarted = companies.flatMap((c) =>
    c.employees
      .filter((e) => e.userId != null && !appsByUserId.has(e.userId))
      .map((e) => ({
        userId: e.userId!,
        name: [e.firstName, e.lastName].filter(Boolean).join(' ') || '—',
        company: c.companyName,
      })),
  )

  // Signed but never paid — money on the table
  const signedUnpaid = signed
    .filter((a) => a.status !== 'paid' && !a.payments.length)
    .map((a) => ({
      userId: a.userId,
      name: [a.firstName, a.lastName].filter(Boolean).join(' ') || '—',
      amount: monthlyTotal(a),
    }))

  return {
    companies: companies.length,
    clients: companies.reduce((sum, c) => sum + c.employees.length, 0),
    activeLeads,
    applications: {
      total: applications.length,
      signed: signed.length,
      paid: paid.length,
      inProgress: inProgress.length,
      notStarted: notStarted.length,
    },
    monthlyBook,
    paidThisMonth: {
      count: paidMonthAgg._count,
      total: Number((paidMonthAgg._sum.amount || 0).toFixed(2)),
    },
    attention: {
      signedUnpaid: signedUnpaid.slice(0, 10),
      declined: declined.map((p) => ({
        userId: p.application.userId,
        name: [p.application.firstName, p.application.lastName].filter(Boolean).join(' ') || '—',
        amount: p.amount,
        message: p.message,
        createdAt: p.createdAt,
        resolved: p.application.status === 'paid',
      })).filter((d) => !d.resolved),
      notStarted: notStarted.slice(0, 10),
    },
  }
})
