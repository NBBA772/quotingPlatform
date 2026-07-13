// /server/api/user/me.ts
import prisma from '~/server/database/client';
import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, 'auth_token')
  if (!authToken) return { error: 'No auth token' }

  // Fetch user by session
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: { include: { insuranceAgent: true } } }
  })

  if (!session?.user) return { error: 'User not found' }

  const user = session.user
  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      insuranceAgentId: user.insuranceAgent?.id ?? null
    }
  }
})
