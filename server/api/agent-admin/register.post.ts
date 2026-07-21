import { readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// AppAdmin creates an agent-manager (upline) login: an AgentAdmin + linked User.
export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const body = await readBody(event)
  const { firstName, lastName, email, username, password } = body
  if (!firstName || !lastName || !email || !username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }
  if (String(password).length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  try {
    const hashed = await bcrypt.hash(String(password), 10)
    const agentAdmin = await prisma.agentAdmin.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashed,
        users: {
          create: {
            firstName,
            lastName,
            email,
            username,
            password: hashed,
            loginType: 'email',
          },
        },
      },
      include: { users: { select: { id: true } } },
    })
    return { success: true, agentAdmin }
  } catch (err: any) {
    console.error('Agent manager registration failed:', err)
    if (err?.code === 'P2002') {
      const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'email or username'
      throw createError({ statusCode: 409, statusMessage: `An account with this ${fields} already exists` })
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to create agent manager' })
  }
})
