/**
 * @swagger
 * /api/insurance-agent/send-invite:
 *   post:
 *     summary: Send an insurance agent invite
 *     description: >
 *       Sends an invitation email to a new insurance agent and stores the invite in the database.
 *       Requires the authenticated App Admin.
 *     tags:
 *       - Insurance Agent
 *     security:
 *       - cookieAuth: []  # uses auth_token cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new.agent@example.com"
 *     responses:
 *       200:
 *         description: Invite successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized or invalid session
 *       403:
 *         description: User is not an App Admin
 *       500:
 *         description: Failed to send invite
 */

import { Resend } from "resend"
import prisma from "~/server/database/client"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Get session user
    const authToken = getCookie(event, "auth_token")
    if (!authToken) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }

    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    })

    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Invalid session" })
    }

    const user = session.user

    // Only allow App Admins to invite agents
    if (!user.appAdminId) {
    throw createError({
        statusCode: 403,
        statusMessage: "Only App Admins can invite insurance agents",
    })
    }


    // Save invite in DB
    await prisma.insuranceAgentInvite.create({
      data: {
        email: body.email,
        invitedById: user.id,
      },
    })

    // Init Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    const signupLink = `https://www.businessbenefitalliance.com/register-admin`

    const { error } = await resend.emails.send({
      from: "noreply@updates.businessbenefitalliance.com",
      to: body.email,
      subject: "You're Invited to Join as an Insurance Agent",
      html: `
        <p>Hello,</p>
        <p>You’ve been invited to join our platform as an <b>admin</b>.</p>
        <p>Please click the link below to create your account:</p>
        <p><a href="${signupLink}">Create Account</a></p>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      throw createError({ statusCode: 500, statusMessage: "Failed to send invite" })
    }

    return { success: true }
  } catch (err) {
    console.error("Error sending insurance agent invite:", err)
    throw createError({ statusCode: 500, statusMessage: "Failed to send invite" })
  }
})
