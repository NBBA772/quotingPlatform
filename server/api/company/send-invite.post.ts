/**
 * @swagger
 * /api/company/send-invite:
 *   post:
 *     summary: Send an employee invite
 *     description: >
 *       Sends a company invitation email to a new employee and stores the invite in the database.
 *       Requires the authenticated user to be linked to a company.
 *     tags:
 *       - Company
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
 *                 example: "new.employee@example.com"
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
 *       400:
 *         description: User is not linked to a company
 *       401:
 *         description: Unauthorized or invalid session
 *       404:
 *         description: Company code not found
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

    // Ensure user is tied to a company
    if (!user.companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User is not linked to a company",
      })
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { businessCode: true, companyName: true },
    })

    if (!company?.businessCode) {
      throw createError({ statusCode: 404, statusMessage: "Company code not found" })
    }

    // Save invite in DB
    await prisma.employeeInvite.create({
      data: {
        email: body.email,
        companyId: user.companyId,
      },
    })

    const signupLink = `https://www.businessbenefitalliance.com/register-employee`
    // Init Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
      from: "noreply@updates.businessbenefitalliance.com",
      to: body.email,
      subject: `Your Company Code for ${company.companyName}`,
      html: `
        <p>Hello,</p>
        <p>Here is your company code for <b>${company.companyName}</b>:</p>
        <h2>${company.businessCode}</h2>

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
    console.error("Error sending invite:", err)
    throw createError({ statusCode: 500, statusMessage: "Failed to send invite" })
  }
})
