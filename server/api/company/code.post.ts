// /server/api/company/code.post.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { companyId, businessCode } = body

  if (!companyId || !businessCode || businessCode.length !== 6) {
    throw createError({ statusCode: 400, message: 'Invalid company or code' })
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { businessCode }
  })

  return { success: true, company: updatedCompany }
})
