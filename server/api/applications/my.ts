import prisma from "~/server/database/client";
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, 'auth_token')
  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // get user from session
const session = await prisma.session.findUnique({
  where: { authToken },
  include: { user: { include: { insuranceApplications: true } } }
})
console.log('User:', session?.user)
console.log('Applications:', session?.user?.insuranceApplications)

  if (!session?.user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const applications = await prisma.insuranceApplication.findMany({
    where: { userId: session.user.id },
    include: { dependents: true, ancillaryPlans: true }
  })

  return applications
})
