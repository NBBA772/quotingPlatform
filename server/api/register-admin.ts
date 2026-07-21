/**
 * @swagger
 * /api/register-appadmin:
 *   post:
 *     summary: Register a new AppAdmin
 *     description: Creates a new AppAdmin and links it to a User account.
 *     tags:
 *       - AppAdmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - username
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Super"
 *               lastName:
 *                 type: string
 *                 example: "Admin"
 *               email:
 *                 type: string
 *                 example: "admin@businessbenefitalliance.com"
 *               username:
 *                 type: string
 *                 example: "appadmin"
 *               password:
 *                 type: string
 *                 example: "SuperSecurePassword123!"
 *     responses:
 *       200:
 *         description: AppAdmin successfully registered
 */
import prisma from '~/server/database/client'
import { hash } from 'bcryptjs'
import { Resend } from 'resend'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { firstName, lastName, email, username, password } = body

    if (!firstName || !lastName || !email || !username || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    // Admin creation is restricted to:
    //  1) an authenticated AppAdmin (the dashboard "Add Admin Login" form), or
    //  2) someone self-registering from a valid invite (the /register-agent page).
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '') || getCookie(event, 'auth_token')
    let isAdminCaller = false
    if (token) {
      const caller = await getUserByAuthToken(token)
      if (caller?.appAdminId) isAdminCaller = true
    }

    let invite: { id: number } | null = null
    if (!isAdminCaller) {
      invite = await prisma.insuranceAgentInvite.findFirst({
        where: { email, acceptedAt: null },
        select: { id: true },
      })
      if (!invite) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin creation requires an authenticated admin or a valid invite',
        })
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create or find AppAdmin
    const appAdmin = await prisma.appAdmin.upsert({
      where: { username },
      update: {},
      create: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
      },
    })

    // Create or link User
    const user = await prisma.user.upsert({
      where: { username },
      update: { appAdminId: appAdmin.id },
      create: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        appAdminId: appAdmin.id,
      },
    })

    // Consume the invite so the link can't be reused to mint more admins.
    if (invite) {
      await prisma.insuranceAgentInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }).catch((e) => console.error('Failed to mark invite accepted:', e))
    }

    // When an admin creates the login directly, email the new admin their
    // credentials (self-registrants set their own password, so skip them).
    // Best-effort: creation succeeds even if the email fails.
    let emailSent = false
    if (isAdminCaller) {
      try {
        const base = process.env.BASE_URL || 'https://www.businessbenefitalliance.com'
        const loginUrl = `${base}/login`
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { error } = await resend.emails.send({
          from: 'noreply@updates.businessbenefitalliance.com',
          to: email,
          subject: 'Your admin account is ready',
          html: `
            <p>Hello ${firstName},</p>
            <p>An admin account has been created for you on the NBBA platform. You can sign in with the credentials below:</p>
            <p>
              <b>Login:</b> <a href="${loginUrl}">${loginUrl}</a><br/>
              <b>Email:</b> ${email}<br/>
              <b>Password:</b> ${password}
            </p>
            <p>For your security, please sign in and change your password as soon as possible.</p>
          `,
        })
        emailSent = !error
        if (error) console.error('Resend error (admin welcome):', error)
      } catch (e) {
        console.error('Failed to send admin welcome email:', e)
      }
    }

    return { success: true, appAdmin, user, emailSent }
  } catch (err: any) {
    console.error('AppAdmin registration failed:', err)
    // Preserve known statuses (400/403) so the UI shows the real reason
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to register AppAdmin' })
  }
})
