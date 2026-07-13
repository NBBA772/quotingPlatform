// /api/leads/accepted-companies.ts
import prisma from '~/server/database/client';

export default defineEventHandler(async () => {
  const invites = await prisma.leadInvite.findMany({
    where: {
      acceptedAt: { not: null }, // only accepted
    },
    include: {
      lead: true,
    },
  })

  // get all emails from accepted invites
  const emails = invites.map((i) => i.email)

  // find users by those emails, and include their companies + employees
  const usersWithCompanies = await prisma.user.findMany({
    where: {
      email: { in: emails },
      companyId: { not: null },
    },
    include: {
      company: {
        include: {
          employees: true,
        },
      },
    },
  })

  // normalize unique companies
  const companiesMap = new Map()
  for (const u of usersWithCompanies) {
    if (u.company) {
      companiesMap.set(u.company.id, u.company)
    }
  }

  return Array.from(companiesMap.values())
})
