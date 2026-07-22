import prisma from '~/server/database/client'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

// Permanently deletes a user and every row that depends on it, in FK-safe order.
// Used by the permanent-delete endpoints for enrollees and for the login
// accounts behind agents/admins/managers. Runs inside a transaction.
export async function purgeUser(tx: Tx, userId: number) {
  // Applications and everything hanging off them
  const apps = await tx.insuranceApplication.findMany({ where: { userId }, select: { id: true } })
  const appIds = apps.map((a) => a.id)
  if (appIds.length) {
    await tx.payment.deleteMany({ where: { applicationId: { in: appIds } } })
    await tx.signatureCode.deleteMany({ where: { applicationId: { in: appIds } } })
    await tx.auditTrail.deleteMany({ where: { insuranceApplicationId: { in: appIds } } })
    await tx.dependent.deleteMany({ where: { applicationId: { in: appIds } } })
    await tx.ancillaryPlan.deleteMany({ where: { applicationId: { in: appIds } } })
    await tx.insuranceApplication.deleteMany({ where: { userId } })
  }

  // Payment authorizations + their audit trails
  await tx.paymentAuthorizationAuditTrail.deleteMany({
    where: { OR: [{ userId }, { paymentAuthorization: { userId } }] },
  })
  await tx.paymentAuthorization.deleteMany({ where: { userId } })

  // Remaining audit trails tied directly to the user
  await tx.auditTrail.deleteMany({ where: { userId } })

  await tx.session.deleteMany({ where: { userId } })
  await tx.photo.deleteMany({ where: { userId } })

  // Plans → benefits; provider networks → providers
  await tx.benefit.deleteMany({ where: { plan: { userId } } })
  await tx.plan.deleteMany({ where: { userId } })
  await tx.provider.deleteMany({ where: { userId } })
  await tx.providerNetwork.deleteMany({ where: { userId } })

  await tx.claimSupport.deleteMany({ where: { userId } })
  await tx.insuranceCard.deleteMany({ where: { userId } })

  // Lead activity written by this user (as an agent)
  await tx.leadInvite.deleteMany({ where: { agentId: userId } })
  await tx.leadNote.deleteMany({ where: { agentId: userId } })
  await tx.insuranceAgentInvite.deleteMany({ where: { invitedById: userId } })

  await tx.subscription.deleteMany({ where: { userId } })

  // Employee (enrollee) record
  await tx.employee.deleteMany({ where: { userId } })

  // Insurance agent record — first release its companies/agreements
  const agent = await tx.insuranceAgent.findUnique({ where: { userId }, select: { id: true } })
  if (agent) {
    await tx.company.updateMany({ where: { agentId: agent.id }, data: { agentId: null } })
    await tx.companyAgreement.updateMany({ where: { agentId: agent.id }, data: { agentId: null } })
    await tx.insuranceAgent.delete({ where: { id: agent.id } })
  }

  // Detach from any company so the FK doesn't block deletion
  await tx.user.update({ where: { id: userId }, data: { companyId: null } })

  await tx.user.delete({ where: { id: userId } })
}

// Permanently deletes a company and everything under it: its enrollees
// (employees + their users/data), company admins, agreements, custom plans,
// invites and requests. Reuses purgeUser for each person.
export async function purgeCompany(tx: Tx, companyId: number) {
  // Enrollees (employees) and their accounts
  const employees = await tx.employee.findMany({ where: { companyId }, select: { id: true, userId: true } })
  for (const e of employees) {
    if (e.userId) await purgeUser(tx, e.userId) // also removes the employee row
    else await tx.employee.delete({ where: { id: e.id } })
  }

  // Company administrators + their login accounts
  const admins = await tx.companyAdministrator.findMany({ where: { companyId }, select: { id: true } })
  for (const a of admins) {
    await tx.session.deleteMany({ where: { companyAdminId: a.id } })
    const adminUsers = await tx.user.findMany({
      where: { companyAdminId: a.id },
      select: { id: true, appAdminId: true, agentAdminId: true, insuranceAgent: { select: { id: true } } },
    })
    for (const u of adminUsers) {
      if (u.appAdminId || u.agentAdminId || u.insuranceAgent) {
        await tx.user.update({ where: { id: u.id }, data: { companyAdminId: null } })
      } else {
        await purgeUser(tx, u.id)
      }
    }
    await tx.companyAdministrator.delete({ where: { id: a.id } })
  }

  // Agreements (+ their signature codes)
  const agreements = await tx.companyAgreement.findMany({ where: { companyId }, select: { id: true } })
  if (agreements.length) {
    const agIds = agreements.map((x) => x.id)
    await tx.signatureCode.deleteMany({ where: { companyAgreementId: { in: agIds } } })
    await tx.companyAgreement.deleteMany({ where: { companyId } })
  }

  // Custom plans (benefits cascade; applications' customPlanId is set null by FK)
  await tx.customPlan.deleteMany({ where: { companyId } })

  await tx.employeeInvite.deleteMany({ where: { companyId } })
  await tx.sEORequest.deleteMany({ where: { companyId } })
  await tx.webDevelopmentRequest.deleteMany({ where: { companyId } })

  // Detach any lingering users, then delete the company
  await tx.user.updateMany({ where: { companyId }, data: { companyId: null } })
  await tx.company.delete({ where: { id: companyId } })
}

// If a manager (AgentAdmin) has no login users left, detach its downline and delete it.
export async function cleanupOrphanAgentAdmin(tx: Tx, agentAdminId: number) {
  const remaining = await tx.user.count({ where: { agentAdminId } })
  if (remaining === 0) {
    await tx.insuranceAgent.updateMany({ where: { agentAdminId }, data: { agentAdminId: null } })
    await tx.agentAdmin.deleteMany({ where: { id: agentAdminId } })
  }
}
