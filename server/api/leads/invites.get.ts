// /server/api/leads/invites.get.ts
import { defineEventHandler } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async () => {
  const invites = await prisma.leadInvite.findMany({
    include: {
      agent: true,
      lead: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return { invites }
})
