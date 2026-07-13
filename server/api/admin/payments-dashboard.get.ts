import { createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

function addOneMonth(date: Date): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return next
}

function monthlyTotal(app: any): number {
  let total = 0
  if (app.healthPlanPrice != null) total += app.healthPlanPrice
  if (app.visionAndDentalPlan && app.visionAndDentalPrice != null) total += app.visionAndDentalPrice
  for (const plan of app.ancillaryPlans || []) {
    if (plan.price != null) total += plan.price
  }
  return Number(total.toFixed(2))
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  if (!user.appAdminId) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Sunday
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [paidWeek, paidMonth, declined, applications, pendingManual] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'succeeded', createdAt: { gte: startOfWeek } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: 'succeeded', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      where: { status: 'declined' },
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: {
        application: {
          select: { id: true, userId: true, firstName: true, lastName: true, groupName: true, status: true },
        },
      },
    }),
    prisma.insuranceApplication.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        groupName: true,
        groupNumber: true,
        status: true,
        signedAt: true,
        createdAt: true,
        updatedAt: true,
        healthPlanPrice: true,
        visionAndDentalPlan: true,
        visionAndDentalPrice: true,
        ancillaryPlans: { select: { price: true } },
        payments: {
          where: { status: 'succeeded' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.payment.findMany({
      where: { status: 'authorized' },
      orderBy: { createdAt: 'asc' },
      include: {
        application: {
          select: { id: true, userId: true, firstName: true, lastName: true, groupName: true },
        },
      },
    }),
  ])

  // Application funnel counts
  const funnel: Record<string, number> = {}
  for (const app of applications) {
    const status = app.status || 'draft'
    funnel[status] = (funnel[status] || 0) + 1
  }

  // Upcoming payments: active (signed/paid) applications; next due date is one
  // month after the last successful payment, or after signing if never paid.
  const upcoming = applications
    .filter((app) => ['signed', 'paid'].includes(app.status || ''))
    .map((app) => {
      const amount = monthlyTotal(app)
      const lastPaidAt = app.payments[0]?.createdAt || null
      const anchor = lastPaidAt || app.signedAt || app.updatedAt
      const nextDueDate = lastPaidAt ? addOneMonth(lastPaidAt) : app.status === 'paid' ? addOneMonth(anchor) : anchor
      return {
        applicationId: app.id,
        userId: app.userId,
        applicant: [app.firstName, app.lastName].filter(Boolean).join(' ') || '—',
        group: app.groupName || app.groupNumber || '—',
        amount,
        lastPaidAt,
        nextDueDate,
        overdue: nextDueDate < now,
      }
    })
    .filter((u) => u.amount > 0)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 50)

  // Recently submitted applications (newest first)
  const recentApplications = applications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)
    .map((app) => ({
      applicationId: app.id,
      userId: app.userId,
      applicant: [app.firstName, app.lastName].filter(Boolean).join(' ') || '—',
      group: app.groupName || app.groupNumber || '—',
      status: app.status || 'draft',
      amount: monthlyTotal(app),
      createdAt: app.createdAt,
    }))

  return {
    pendingManual: pendingManual.map((p) => ({
      id: p.id,
      applicationId: p.applicationId,
      applicant: [p.application.firstName, p.application.lastName].filter(Boolean).join(' ') || '—',
      group: p.application.groupName || '—',
      amount: p.amount,
      method: p.method,
      invoice: p.invoice,
      createdAt: p.createdAt,
      hasPdf: !!p.pdfUrl,
    })),
    paidThisWeek: { count: paidWeek._count, total: Number((paidWeek._sum.amount || 0).toFixed(2)) },
    paidThisMonth: { count: paidMonth._count, total: Number((paidMonth._sum.amount || 0).toFixed(2)) },
    declinedCount: declined.length,
    declined: declined.map((p) => ({
      id: p.id,
      applicationId: p.applicationId,
      userId: p.application.userId,
      applicant: [p.application.firstName, p.application.lastName].filter(Boolean).join(' ') || '—',
      group: p.application.groupName || '—',
      amount: p.amount,
      method: p.method,
      message: p.message,
      createdAt: p.createdAt,
      // retry is available as long as the application hasn't since been paid
      canRetry: p.application.status !== 'paid',
    })),
    upcoming,
    funnel,
    totalApplications: applications.length,
    recentApplications,
  }
})
