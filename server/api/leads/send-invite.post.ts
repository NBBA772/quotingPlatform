/**
 * @swagger
 * /api/leads/send-invite:
 *   post:
 *     summary: Send an invite to a lead
 *     description: >
 *       Sends an invitation email to a lead and stores the invite in the database. 
 *       Only the agent assigned to the lead can send an invite.
 *     tags:
 *       - Leads
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
 *               - leadId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "lead@example.com"
 *               leadId:
 *                 type: integer
 *                 example: 1
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
 *         description: Missing email or leadId
 *       401:
 *         description: Unauthorized or invalid session
 *       403:
 *         description: Lead not found or unauthorized
 *       500:
 *         description: Failed to send invite
 */

import { Resend } from "resend"
import prisma from "~/server/database/client"
import { getCookie, createError, readBody } from "h3"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, leadId } = body

    if (!email || !leadId) {
      throw createError({ statusCode: 400, statusMessage: "Missing email or leadId" })
    }

    const authToken = getCookie(event, "auth_token")
    if (!authToken) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    })

    if (!session?.user) throw createError({ statusCode: 401, statusMessage: "Invalid session" })

    const user = session.user

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead || lead.agentId !== user.id) {
      throw createError({ statusCode: 403, statusMessage: "Lead not found or unauthorized" })
    }

    await prisma.leadInvite.create({
      data: {
        email,
        leadId,
        agentId: user.id,
      },
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
      from: "noreply@updates.businessbenefitalliance.com",
      //to: email,
      to: "donavanjones79@gmail.com",
      subject: `Your Lead Invitation`,
      html: `
        <p>Hello,</p>
        <p>You have been invited by ${user.name} to join our services.</p>
        <p>Contact your agent for more details.</p>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      throw createError({ statusCode: 500, statusMessage: "Failed to send invite" })
    }

    return { success: true }
  } catch (err) {
    console.error("Error sending lead invite:", err)
    throw createError({ statusCode: 500, statusMessage: err?.message || "Failed to send invite" })
  }
})
