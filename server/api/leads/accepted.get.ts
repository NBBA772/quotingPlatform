// /server/api/companies/assigned.ts
import prisma from '~/server/database/client'
import { getQuery } from 'h3'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getCookie(event, 'auth_token')
    if (!authToken) throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })

    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })

    const agent = await prisma.insuranceAgent.findUnique({
      where: { userId: user.id },
    })
    if (!agent) throw createError({ statusCode: 400, statusMessage: 'User is not an agent' })

    // Optional mode filter so the dashboard can request individual / group /
    // custom companies separately. Omitted → all of the agent's companies.
    const enrollmentType = getQuery(event).enrollmentType as string | undefined
    const validType = ['individual', 'group', 'custom'].includes(enrollmentType ?? '')
      ? enrollmentType
      : undefined

    const assignedRaw = await prisma.company.findMany({
      where: { agentId: agent.id, ...(validType ? { enrollmentType: validType } : {}) },
      include: {
        agent: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true 
          } 
        },
        administrators: {
          include: {
            users: {
              include: {
                insuranceApplications: {
                  select: {
                    id: true,
                    pdfUrl: true,
                    spouseFirstName: true,
                    spouseLastName: true,
                    dependents: { select: { id: true } },
                  }
                },
                paymentAuthorizations: {
                  select: {
                    id: true,
                    pdfUrl: true,
                  }
                }
              }
            }
          }
        },
        employees: {
          include: {
            user: {
              include: {
                insuranceApplications: {
                  select: {
                    id: true,
                    pdfUrl: true,
                    spouseFirstName: true,
                    spouseLastName: true,
                    dependents: { select: { id: true } },
                  }
                },
                paymentAuthorizations: {
                  select: {
                    id: true,
                    pdfUrl: true,
                  }
                }
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

const assigned = assignedRaw.map((company) => {
  // Get the company admin
  const companyAdmin = company.administrators?.[0]
    ? {
        id: company.administrators[0].id,
        firstName: company.administrators[0].firstName,
        lastName: company.administrators[0].lastName,
        email: company.administrators[0].email,
        phone: company.administrators[0].phoneNumber,
        username: company.administrators[0].username,
        userId: company.administrators[0].users?.[0]?.id || null,
        companyId: company.id,
      }
    : null

  // Process employees with signing status
  const processedEmployees = (company.employees || []).map((emp) => {
    const hasSignedApplication = emp.user?.insuranceApplications?.some(app => app.pdfUrl) || false
    const hasSignedPayment = emp.user?.paymentAuthorizations?.some(auth => auth.pdfUrl) || false
    // Family plan = the application covers a spouse and/or dependents
    const hasFamily = emp.user?.insuranceApplications?.some(
      app => app.spouseFirstName || app.spouseLastName || (app.dependents?.length ?? 0) > 0
    ) || false

    return {
      ...emp,
      hasSigned: hasSignedApplication && hasSignedPayment,
      hasSignedApplication,
      hasSignedPayment,
      hasFamily,
    }
  })

  // Process administrators with signing status
  const processedAdmins = (company.administrators || []).map((admin) => {
    const adminUser = admin.users?.[0]
    const hasSignedApplication = adminUser?.insuranceApplications?.some(app => app.pdfUrl) || false
    const hasSignedPayment = adminUser?.paymentAuthorizations?.some(auth => auth.pdfUrl) || false
    const hasFamily = adminUser?.insuranceApplications?.some(
      app => app.spouseFirstName || app.spouseLastName || (app.dependents?.length ?? 0) > 0
    ) || false

    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phoneNumber,
      username: admin.username,
      userId: adminUser?.id || null,
      companyId: company.id,
      hasSigned: hasSignedApplication && hasSignedPayment,
      hasSignedApplication,
      hasSignedPayment,
      hasFamily,
    }
  })

  // Merge employees and admins, avoiding duplicates based on userId
  const employeeUserIds = new Set(processedEmployees.map(e => e.user?.id).filter(Boolean))
  const nonDuplicateAdmins = processedAdmins.filter(admin => admin.userId && !employeeUserIds.has(admin.userId))
  
  const employees = [...processedEmployees, ...nonDuplicateAdmins]

  return {
    ...company,
    companyAdmin,
    employees,
  }
})


    return { assigned }
  } catch (err: any) {
    console.error('Error fetching assigned companies:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Internal Server Error',
    })
  }
})
