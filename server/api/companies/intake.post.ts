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
      'contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone', 'contactPassword',
      'streetAddress', 'city', 'state', 'zipCode',
    ]
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        throw createError({ statusCode: 400, statusMessage: `Missing required field: ${field}` })
      }
    }
    if (String(body.contactPassword).length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
    }

    // The enrollee becomes an employee — reject up front if that email is
    // already taken, instead of failing halfway through.
    const existingEmployee = await prisma.employee.findUnique({ where: { email: body.contactEmail } })
    if (existingEmployee) {
      throw createError({ statusCode: 409, statusMessage: 'An enrollee with this email already exists' })
    }

    const businessCode = await generateUniqueBusinessCode()
    const enrolleeName = `${String(body.contactFirstName).trim()} ${String(body.contactLastName).trim()}`.trim()

    // The data model hangs off Company, so each individual enrollee gets a
    // household record derived from their own details.
    const company = await prisma.company.create({
      data: {
        companyName: enrolleeName,
        ein: null,
        salesmanCode: body.npn || null,
        industry: 'Individual',
        streetAddress: body.streetAddress,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        phoneNumber: body.contactPhone,
        companyEmail: body.contactEmail,
        website: null,
        employeeSize: '1',
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

    // Seed the insurance application with the intake details so the
    // enrollee's application opens prefilled: NPN, agent name, and their
    // demographics. Best-effort — intake succeeds even if this fails.
    try {
      const existingApplication = await prisma.insuranceApplication.findFirst({
        where: { userId: employeeUser.id },
      })
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
            streetAddress: body.streetAddress,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            isDivision: false,
          },
        })
      }
    } catch (err) {
      console.error('Failed to seed application from intake:', err)
    }

    // Welcome email — the password was set verbally on the call, so it is
    // never included here. Best-effort: the records already exist either way.
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
          your enrollment account.</p>
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
      employeeName: enrolleeName,
      emailSent,
    }
  } catch (err: any) {
    console.error('❌ Enrollee intake error:', err)
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
