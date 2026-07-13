import { readBody, createError, getRequestURL } from 'h3'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

async function generateUniqueBusinessCode() {
  let code: string
  let exists = true
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString()
    const existing = await prisma.company.findUnique({ where: { businessCode: code } })
    exists = !!existing
  }
  return code!
}

// Agent phone intake: creates the company and adds the client contact as its
// first employee, so they immediately appear on the agent's dashboard and can
// be taken into the insurance application.
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const agent = await prisma.insuranceAgent.findUnique({ where: { userId: user.id } })
    if (!agent && !user.appAdminId) {
      throw createError({ statusCode: 403, statusMessage: 'Only insurance agents can create companies' })
    }

    const body = await readBody(event)
    const required = [
      'companyName', 'industry', 'streetAddress', 'city', 'state', 'zipCode',
      'phoneNumber', 'companyEmail', 'employeeSize',
      'contactFirstName', 'contactLastName', 'contactEmail', 'contactPassword',
    ]
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        throw createError({ statusCode: 400, statusMessage: `Missing required field: ${field}` })
      }
    }
    if (String(body.contactPassword).length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
    }

    // The contact becomes an employee — reject up front if that email is taken
    // by an employee of another company, instead of failing halfway through.
    const existingEmployee = await prisma.employee.findUnique({ where: { email: body.contactEmail } })
    if (existingEmployee) {
      throw createError({ statusCode: 409, statusMessage: 'An employee with this contact email already exists' })
    }

    const businessCode = await generateUniqueBusinessCode()

    const company = await prisma.company.create({
      data: {
        companyName: body.companyName,
        ein: body.ein || null,
        salesmanCode: body.salesmanCode || null,
        industry: body.industry,
        streetAddress: body.streetAddress,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        phoneNumber: body.phoneNumber,
        companyEmail: body.companyEmail,
        website: body.website || null,
        employeeSize: String(body.employeeSize),
        businessCode,
        agentId: agent?.id ?? null,
      },
    })

    // Create (or reuse) the User for the contact, then the Employee record.
    // The User is what the enrollment flow (/enroll/[userId]) works off.
    // The agent sets the password with the client on the phone.
    const hashedPassword = await bcrypt.hash(String(body.contactPassword), 10)
    let employeeUser = await prisma.user.findUnique({ where: { email: body.contactEmail } })
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
      // Existing account: attach to the company but keep their current password
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

    // Welcome email — the password was set verbally on the call, so it is
    // never included here. Best-effort: the records already exist either way.
    let emailSent = false
    try {
      const origin = process.env.BASE_URL || getRequestURL(event).origin
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { error } = await resend.emails.send({
        from: 'noreply@updates.businessbenefitalliance.com',
        to: body.contactEmail,
        subject: `Welcome to ${company.companyName} — Group #${businessCode}`,
        html: `
          <p>Hello ${body.contactFirstName},</p>
          <p>${agent ? `${agent.firstName} ${agent.lastName}` : 'Your insurance agent'} has set up
          <b>${company.companyName}</b> (Group #${businessCode}) and added you as a member.</p>
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
      businessCode,
      employeeUserId: employeeUser.id,
      employeeName: `${body.contactFirstName} ${body.contactLastName}`,
      emailSent,
    }
  } catch (err: any) {
    console.error('❌ Company intake error:', err)
    if (err?.code === 'P2002') {
      const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'email, username, or phone'
      throw createError({ statusCode: 409, statusMessage: `An account with this ${fields} already exists` })
    }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to create company',
    })
  }
})
