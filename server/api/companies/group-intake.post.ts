import { readBody, createError, getRequestURL } from 'h3'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import prisma from '~/server/database/client'
import { requireAuthUser, assertAgentCanEnroll } from '~/server/utils/enrollmentAuth'

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

// Agent-driven onboarding of a real company (group or custom). Creates the
// Company, its first CompanyAdministrator, and a login for that admin. The
// admin then logs in to add employees (and, for custom companies, an AppAdmin
// authors the plans those employees pick from).
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const body = await readBody(event)
    const enrollmentType = body.enrollmentType === 'custom' ? 'custom' : 'group'

    const agent = await assertAgentCanEnroll(user, enrollmentType)

    const required = [
      'companyName', 'industry', 'streetAddress', 'city', 'state', 'zipCode',
      'companyPhone', 'companyEmail', 'employeeSize',
      'adminFirstName', 'adminLastName', 'adminEmail', 'adminPhone', 'adminPassword',
    ]
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        throw createError({ statusCode: 400, statusMessage: `Missing required field: ${field}` })
      }
    }
    if (String(body.adminPassword).length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
    }

    // The company admin gets a real login — reject a taken admin email up front.
    const existingAdmin = await prisma.companyAdministrator.findUnique({ where: { email: body.adminEmail } })
    if (existingAdmin) {
      throw createError({ statusCode: 409, statusMessage: 'A company admin with this email already exists' })
    }
    const existingUserForEmail = await prisma.user.findUnique({
      where: { email: body.adminEmail },
      include: { insuranceAgent: { select: { id: true } } },
    })
    if (existingUserForEmail?.insuranceAgent) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This email belongs to an agent account — use the company admin\'s own email',
      })
    }

    const businessCode = await generateUniqueBusinessCode()
    const hashedPassword = await bcrypt.hash(String(body.adminPassword), 10)

    const company = await prisma.company.create({
      data: {
        companyName: String(body.companyName).trim(),
        ein: body.ein || null,
        salesmanCode: body.npn || null,
        industry: String(body.industry).trim(),
        enrollmentType,
        streetAddress: body.streetAddress,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        phoneNumber: body.companyPhone,
        companyEmail: body.companyEmail,
        website: body.website || null,
        employeeSize: String(body.employeeSize),
        businessCode,
        agentId: agent?.id ?? null,
      },
    })

    // Create (or reuse) the admin's User, then the CompanyAdministrator record.
    let adminUser = existingUserForEmail
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          firstName: body.adminFirstName,
          lastName: body.adminLastName,
          email: body.adminEmail,
          phone: body.adminPhone || null,
          username: body.adminEmail,
          password: hashedPassword,
          loginType: 'email',
          companyId: company.id,
        },
      })
    } else {
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { companyId: company.id },
      })
    }

    const companyAdmin = await prisma.companyAdministrator.create({
      data: {
        firstName: body.adminFirstName,
        lastName: body.adminLastName,
        username: adminUser.username || body.adminEmail,
        email: body.adminEmail,
        password: adminUser.password || hashedPassword,
        phoneNumber: body.adminPhone,
        company: { connect: { id: company.id } },
        users: { connect: { id: adminUser.id } },
      },
    })

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { companyAdminId: companyAdmin.id },
    })

    // Welcome email — password was set verbally on the call, never included.
    let emailSent = false
    try {
      const origin = process.env.BASE_URL || getRequestURL(event).origin
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { error } = await resend.emails.send({
        from: 'noreply@updates.businessbenefitalliance.com',
        to: body.adminEmail,
        subject: 'Your company benefits account is ready',
        html: `
          <p>Hello ${body.adminFirstName},</p>
          <p>${agent ? `${agent.firstName} ${agent.lastName}` : 'Your insurance agent'} has set up a
          benefits account for <b>${company.companyName}</b>.</p>
          <p>Log in at <a href="${origin}/login">${origin}/login</a> with your email
          (<b>${body.adminEmail}</b>) and the password you set with your agent to start adding employees.</p>
          <p>Your company code is <b>${businessCode}</b>.</p>
        `,
      })
      emailSent = !error
      if (error) console.error('Resend error:', error)
    } catch (err) {
      console.error('Failed to send company welcome email:', err)
    }

    return {
      success: true,
      companyId: company.id,
      enrollmentType,
      businessCode,
      companyAdminId: companyAdmin.id,
      adminUserId: adminUser.id,
      companyName: company.companyName,
      emailSent,
    }
  } catch (err: any) {
    console.error('❌ Group intake error:', err)
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
