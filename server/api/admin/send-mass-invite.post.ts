/**
 * @swagger
 * /api/insurance-agent/send-mass-invite:
 *   post:
 *     summary: Send multiple insurance agent invites
 *     description: >
 *       Sends invitation emails to multiple insurance agents and stores the invites in the database.
 *       Requires the authenticated user to be an App Admin.
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
 *               - emails
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["agent1@example.com", "agent2@example.com"]
 *     responses:
 *       200:
 *         description: Invites successfully sent
 *       400:
 *         description: No emails provided
 *       401:
 *         description: Unauthorized or invalid session
 *       403:
 *         description: User is not an App Admin
 *       500:
 *         description: Failed to send invites
 */

import { Resend } from "resend";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const emails: string[] = body.emails || [];

    if (!emails.length) {
      throw createError({ statusCode: 400, statusMessage: "No emails provided" });
    }

    // Get session user
    const authToken = getCookie(event, "auth_token");
    if (!authToken) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    });

    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Invalid session" });
    }

    const user = session.user;

    // Only App Admins can send agent invites
    if (!user.appAdminId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Only App Admins can invite insurance agents",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const email of emails) {
      // Save invite
      await prisma.insuranceAgentInvite.create({
        data: {
          email,
          invitedById: user.id,
        },
      });

      // Send email
      const signupLink = `https://www.businessbenefitalliance.com/register-admin`;

      const { error } = await resend.emails.send({
        from: "noreply@updates.businessbenefitalliance.com",
        to: email,
        subject: "You're Invited to Join as an Admin",
        html: `
          <p>Hello,</p>
          <p>You’ve been invited to join our platform as an <b>admin</b>.</p>
          <p>Please click the link below to create your account:</p>
          <p><a href="${signupLink}">Create Account</a></p>
        `,
      });

      if (error) {
        console.error(`Failed to send to ${email}:`, error);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending mass insurance agent invites:", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to send invites" });
  }
});
