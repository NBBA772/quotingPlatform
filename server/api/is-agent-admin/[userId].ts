import { defineEventHandler, getRouterParam } from 'h3'
import prisma from '~/server/database/client'

// Is this user an agent manager (upline)? Mirrors /api/is-app-admin.
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'userId'))
  if (isNaN(id)) return { isAgentAdmin: false }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { agentAdminId: true },
  })

  // A user is an agent-admin if linked to an AgentAdmin — independent of also
  // being a producing agent (a producing agent can manage a downline too).
  return { isAgentAdmin: !!user?.agentAdminId }
})
