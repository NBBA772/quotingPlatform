import { readBody, getRouterParam, createError, getRequestURL } from 'h3'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import prisma from '~/server/database/client'
import { requireAuthUser, assertAgentCanEnroll, type EnrollmentMode } from '~/server/utils/enrollmentAuth'

// Agent adds an enrollee (Employee + User) to an existing group/custom company
// and seeds their application, so the agent can fill out the enrollment form
// for them just like an individual/family enrollee. The group/custom analog of
// /api/companies/intake.
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const companyId = Number(getRouterParam(event, 'id'))
    if (isNaN(companyId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid company id' })
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } })
    if (!company) {
      throw createError({ statusCode: 404, statusMessage: 'Company not found' })
    }

    // Permission is scoped to the company's enrollment mode.
    const mode = (['individual', 'group', 'custom'].includes(company.enrollmentType)
      ? company.enrollmentType
      : 'group') as EnrollmentMode
    const agent = await assertAgentCanEnroll(user, mode)

    const body = await readBody(event)
    const required = ['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone', 'contactPassword']
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        throw createError({ statusCode: 400, statusMessage: `Missing required field: ${field}` })
      }
    }
    if (String(body.contactPassword).length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { email: body.contactEmail } })
    if (existingEmployee) {
      throw createError({ statusCode: 409, statusMessage: 'An enrollee with this email already exists' })
    }
    const existingUserForEmail = await prisma.user.findUnique({
      where: { email: body.contactEmail },
      include: { insuranceAgent: { select: { id: true } } },
    })
    if (existingUserForEmail?.insuranceAgent) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This email belongs to an agent account — use the enrollee\'s own email',
      })
    }

    const hashedPassword = await bcrypt.hash(String(body.contactPassword), 10)

    let employeeUser = existingUserForEmail
    const isNewUser = !employeeUser
    if (!employeeUser) {
      employeeUser = await prisma.user.create({
        data: {
          firstName: body.contactFirstName,
          lastName: body.contactLastName,
          email: body.contactEmail,
          phone: body.contactPhone || null,
          username: body.contactEmail,
          password: hashedPassword,
          loginType: 'email',
          companyId: company.id,
        },
      })
    } else {
      employeeUser = await prisma.user.update({
        where: { id: employeeUser.id },
        data: { companyId: company.id },
      })
    }

    await prisma.employee.create({
      data: {
        firstName: body.contactFirstName,
        lastName: body.contactLastName,
        email: body.contactEmail,
        phone: body.contactPhone || null,
        username: employeeUser.username || body.contactEmail,
        password: employeeUser.password || hashedPassword,
        companyId: company.id,
        userId: employeeUser.id,
      },
    })

    // Seed a prefilled application so the enroll wizard opens ready to fill.
    try {
      const existingApplication = await prisma.insuranceApplication.findFirst({ where: { userId: employeeUser.id } })
      if (!existingApplication) {
        await prisma.insuranceApplication.create({
          data: {
            userId: employeeUser.id,
            groupNumber: body.npn ? String(body.npn).trim() : '',
            groupName: agent ? `${agent.firstName} ${agent.lastName}` : '',
            firstName: body.contactFirstName,
            lastName: body.contactLastName,
            email: body.contactEmail,
            phoneNumber: body.contactPhone,
            streetAddress: body.streetAddress || company.streetAddress,
            city: body.city || company.city,
            state: body.state || company.state,
            zipCode: body.zipCode || company.zipCode,
            isDivision: false,
          },
        })
      }
    } catch (err) {
      console.error('Failed to seed application for added enrollee:', err)
    }

    // Welcome email — best-effort; password was set verbally on the call.
    let emailSent = false
    try {
      const origin = process.env.BASE_URL || getRequestURL(event).origin
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { error } = await resend.emails.send({
        from: 'noreply@updates.businessbenefitalliance.com',
        to: body.contactEmail,
        subject: 'Welcome — your enrollment account is ready',
        html: `
          <p>Hello ${body.contactFirstName},</p>
          <p>${agent ? `${agent.firstName} ${agent.lastName}` : 'Your insurance agent'} has set up
          your enrollment account with <b>${company.companyName}</b>.</p>
          <p>You can log in at <a href="${origin}/login">${origin}/login</a> with your email
          (<b>${body.contactEmail}</b>) and the password ${isNewUser ? 'you set with your agent' : 'for your existing account'}.</p>
        `,
      })
      emailSent = !error
      if (error) console.error('Resend error:', error)
    } catch (err) {
      console.error('Failed to send welcome email:', err)
    }

    return {
      success: true,
      companyId: company.id,
      employeeUserId: employeeUser.id,
      employeeName: `${String(body.contactFirstName).trim()} ${String(body.contactLastName).trim()}`.trim(),
      emailSent,
    }
  } catch (err: any) {
    console.error('❌ Add enrollee error:', err)
    if (err?.code === 'P2002') {
      const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'email, username, or phone'
      throw createError({ statusCode: 409, statusMessage: `An account with this ${fields} already exists` })
    }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to add enrollee',
    })
  }
})
