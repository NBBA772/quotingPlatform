// /server/api/leads/assign-agent.post.ts
import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const { inviteId, agentId } = await readBody(event)

  if (!inviteId || !agentId) {
    throw createError({ statusCode: 400, message: 'inviteId and agentId required' })
  }

  const updated = await prisma.leadInvite.update({
    where: { id: inviteId },
    data: { agentId },
    include: { agent: true },
  })

  return { status: 'success', invite: updated }
})
