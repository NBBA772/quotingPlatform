import { defineEventHandler } from 'h3'
import prisma from '~/server/database/client'
import { requireAgentAdmin } from '~/server/utils/enrollmentAuth'

// The agent manager's downline: each downline agent with their enrollees
// ("his employees") and per-agent counts.
export default defineEventHandler(async (event) => {
  const agentAdmin = await requireAgentAdmin(event)

  const agents = await prisma.insuranceAgent.findMany({
    where: { agentAdminId: agentAdmin.id, deletedAt: null },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      isAvailable: true,
      companies: {
        select: {
          id: true,
          companyName: true,
          enrollmentType: true,
          employees: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userId: true,
              user: {
                select: {
                  insuranceApplications: {
                    select: { id: true, status: true, signedAt: true, pdfUrl: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const downline = agents.map((agent) => {
    const employees = agent.companies.flatMap((c) =>
      c.employees.map((e) => {
        const apps = e.user?.insuranceApplications ?? []
        const signed = apps.some((a) => !!a.signedAt || ['signed', 'paid'].includes(a.status || ''))
        const paid = apps.some((a) => a.status === 'paid')
        return {
          id: e.id,
          userId: e.userId,
          name: [e.firstName, e.lastName].filter(Boolean).join(' ') || '—',
          email: e.email,
          company: c.companyName,
          enrollmentType: c.enrollmentType,
          signed,
          paid,
        }
      }),
    )
    return {
      id: agent.id,
      name: [agent.firstName, agent.lastName].filter(Boolean).join(' ') || '—',
      email: agent.email,
      phone: agent.phone,
      isActive: agent.isActive,
      isAvailable: agent.isAvailable,
      companies: agent.companies.length,
      enrollees: employees.length,
      signed: employees.filter((e) => e.signed).length,
      paid: employees.filter((e) => e.paid).length,
      employees,
    }
  })

  return { downline }
})
