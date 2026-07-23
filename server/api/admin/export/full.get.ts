import { defineEventHandler } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// Admin-only full-database export as JSON. Passwords and auth tokens are
// stripped (not useful and extra-sensitive); everything else is included.
const stripPw = <T extends Record<string, any>>(rows: T[]) =>
  rows.map(({ password, ...rest }: any) => rest)

export default defineEventHandler(async (event) => {
  await requireAppAdmin(event)

  const [
    users, insuranceAgents, agentAdmins, appAdmins, companies, employees, companyAdministrators,
    applications, dependents, ancillaryPlans, payments, paymentAuthorizations, signatureCodes,
    companyAgreements, customPlans, customPlanBenefits, applicationPdfs, auditTrails,
    plans, benefits, providers, providerNetworks, claimSupports, insuranceCards, photos,
    leads, leadInvites, leadNotes, employeeInvites, insuranceAgentInvites,
    seoRequests, webDevelopmentRequests, subscriptions,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.insuranceAgent.findMany(),
    prisma.agentAdmin.findMany(),
    prisma.appAdmin.findMany(),
    prisma.company.findMany(),
    prisma.employee.findMany(),
    prisma.companyAdministrator.findMany(),
    prisma.insuranceApplication.findMany(),
    prisma.dependent.findMany(),
    prisma.ancillaryPlan.findMany(),
    prisma.payment.findMany(),
    prisma.paymentAuthorization.findMany(),
    prisma.signatureCode.findMany(),
    prisma.companyAgreement.findMany(),
    prisma.customPlan.findMany(),
    prisma.customPlanBenefit.findMany(),
    prisma.applicationPdf.findMany(),
    prisma.auditTrail.findMany(),
    prisma.plan.findMany(),
    prisma.benefit.findMany(),
    prisma.provider.findMany(),
    prisma.providerNetwork.findMany(),
    prisma.claimSupport.findMany(),
    prisma.insuranceCard.findMany(),
    prisma.photo.findMany(),
    prisma.lead.findMany(),
    prisma.leadInvite.findMany(),
    prisma.leadNote.findMany(),
    prisma.employeeInvite.findMany(),
    prisma.insuranceAgentInvite.findMany(),
    prisma.sEORequest.findMany(),
    prisma.webDevelopmentRequest.findMany(),
    prisma.subscription.findMany(),
  ])

  const data = {
    exportedAt: new Date().toISOString(),
    users: stripPw(users),
    insuranceAgents: stripPw(insuranceAgents),
    agentAdmins: stripPw(agentAdmins),
    appAdmins: stripPw(appAdmins),
    companies,
    employees: stripPw(employees),
    companyAdministrators: stripPw(companyAdministrators),
    applications,
    dependents,
    ancillaryPlans,
    payments,
    paymentAuthorizations,
    signatureCodes,
    companyAgreements,
    customPlans,
    customPlanBenefits,
    applicationPdfs,
    auditTrails,
    plans,
    benefits,
    providers,
    providerNetworks,
    claimSupports,
    insuranceCards,
    photos,
    leads,
    leadInvites,
    leadNotes,
    employeeInvites,
    insuranceAgentInvites,
    seoRequests,
    webDevelopmentRequests,
    subscriptions,
  }

  event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
  event.node.res.setHeader('Content-Disposition', `attachment; filename="database-export-${new Date().toISOString().slice(0, 10)}.json"`)
  return data
})
