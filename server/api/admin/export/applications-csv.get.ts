import { defineEventHandler, send } from 'h3'
import prisma from '~/server/database/client'
import { requireAppAdmin } from '~/server/utils/enrollmentAuth'

// Admin-only CSV export of every application with the full enrollee data —
// including SSNs, spouse SSN, and each dependent's SSN — which are NOT printed
// on the PDF. Lets the admin look up an SSN.
const cell = (v: any): string => {
  if (v == null) return ''
  const s = v instanceof Date ? v.toISOString() : String(v)
  return `"${s.replace(/"/g, '""')}"` // quote + escape for CSV
}

export default defineEventHandler(async (event) => {
  try {
    await requireAppAdmin(event)

    const apps = await prisma.insuranceApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dependents: true,
        user: {
          include: {
            company: { include: { agent: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    })

    const headers = [
      'Application ID', 'Status', 'Created At', 'Signed At',
      'First Name', 'Middle Name', 'Last Name', 'Email', 'Phone',
      'Date of Birth', 'Age', 'Gender', 'SSN',
      'Street', 'City', 'State', 'Zip',
      'Company / Household', 'Enrollment Type', 'Business Code', 'Agent',
      'NPN', 'Coverage Tier', 'Health Plan', 'Health Price', 'Dental/Vision', 'Dental/Vision Price', 'Ancillary',
      'Job Title', 'Hire Date', 'Hrs/Week',
      'Spouse First', 'Spouse Last', 'Spouse DOB', 'Spouse Gender', 'Spouse SSN',
      'Dependents (Name | DOB | SSN | Relationship)',
    ]

    const rows = [headers.map(cell).join(',')]

    for (const a of apps) {
      const company = a.user?.company
      const agent = company?.agent
      const deps = (a.dependents || [])
        .map((d) =>
          `${[d.firstName, d.lastName].filter(Boolean).join(' ')} | ${
            d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().slice(0, 10) : ''
          } | ${d.socialSecurityNumber || ''} | ${d.relationship || ''}`,
        )
        .join('  ;  ')

      rows.push([
        a.id, a.status, a.createdAt, a.signedAt,
        a.firstName, a.middleName, a.lastName, a.email, a.phoneNumber,
        a.dateOfBirth ? new Date(a.dateOfBirth).toISOString().slice(0, 10) : '', a.age, a.gender, a.socialSecurityNumber,
        a.streetAddress, a.city, a.state, a.zipCode,
        company?.companyName, company?.enrollmentType, company?.businessCode,
        agent ? `${agent.firstName} ${agent.lastName}` : '',
        a.groupNumber, a.coverageTier, a.healthPlan, a.healthPlanPrice, a.visionAndDentalPlan ? 'Yes' : 'No', a.visionAndDentalPrice, a.lifeAncillaryPlan,
        a.jobTitle, a.hireDate ? new Date(a.hireDate).toISOString().slice(0, 10) : '', a.hrsPerWeek,
        a.spouseFirstName, a.spouseLastName,
        a.spouseDateOfBirth ? new Date(a.spouseDateOfBirth).toISOString().slice(0, 10) : '', a.spouseGender, a.spouseSocialSecurityNumber,
        deps,
      ].map(cell).join(','))
    }

    const csv = rows.join('\n')
    event.node.res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    event.node.res.setHeader('Content-Disposition', `attachment; filename="applications-export-${new Date().toISOString().slice(0, 10)}.csv"`)
    return csv
  } catch (err: any) {
    console.error('Applications CSV export failed:', err)
    if (err?.statusCode) throw err
    return send(event, 'Failed to export applications', 500)
  }
})
