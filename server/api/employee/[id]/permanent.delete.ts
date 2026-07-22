import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'
import { purgeUser } from '~/server/utils/hardDelete'

// Permanently deletes an enrollee (employee) and their login + all owned data.
// If they were an individual/family household with no one else left, the
// household company record is removed too.
// Allowed for an app admin, or the insurance agent assigned to the enrollee's company.
export default defineEventHandler(async (event) => {
  const caller = await requireAuthUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid employee id' })

  const employee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, userId: true, companyId: true, company: { select: { agentId: true } } },
  })
  if (!employee) throw createError({ statusCode: 404, statusMessage: 'Enrollee not found' })

  if (!caller.appAdminId) {
    const agent = await prisma.insuranceAgent.findUnique({ where: { userId: caller.id }, select: { id: true } })
    if (!agent || agent.id !== employee.company?.agentId) {
      throw createError({ statusCode: 403, statusMessage: 'Not authorized to delete this enrollee' })
    }
  }

  await prisma.$transaction(async (tx) => {
    if (employee.userId) await purgeUser(tx, employee.userId) // removes the Employee row too
    else await tx.employee.delete({ where: { id: employee.id } })

    // Clean up an emptied individual/family household company.
    const company = await tx.company.findUnique({
      where: { id: employee.companyId },
      select: {
        enrollmentType: true,
        _count: { select: { employees: true, administrators: true, customPlans: true } },
      },
    })
    if (
      company &&
      company.enrollmentType === 'individual' &&
      company._count.employees === 0 &&
      company._count.administrators === 0 &&
      company._count.customPlans === 0
    ) {
      await tx.companyAgreement.deleteMany({ where: { companyId: employee.companyId } })
      await tx.employeeInvite.deleteMany({ where: { companyId: employee.companyId } })
      await tx.user.updateMany({ where: { companyId: employee.companyId }, data: { companyId: null } })
      await tx.company.delete({ where: { id: employee.companyId } })
    }
  }, { timeout: 30000 })

  return { success: true }
})
