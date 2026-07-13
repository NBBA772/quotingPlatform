import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const { companyId } = await readBody(event)
  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'companyId required' })
  }

  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: {
      user: {
        include: {
          insuranceApplications: {
            include: {
              ancillaryPlans: true,
            }
          }
        }
      }
    }
  })

  return employees
})