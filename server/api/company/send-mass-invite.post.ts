/**
 * @swagger
 * /api/company/send-mass-invite:
 *   post:
 *     summary: Send multiple employee invites
 *     description: >
 *       Sends company invitation emails to multiple employees and stores the invites in the database.
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
 *               - emails
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["employee1@example.com", "employee2@example.com"]
 *     responses:
 *       200:
 *         description: Invites successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: No emails provided or user not linked to a company
 *       401:
 *         description: Unauthorized or invalid session
 *       404:
 *         description: Company code not found
 *       500:
 *         description: Failed to send invites
 */

import { Resend } from "resend";
import prisma from "~/server/database/client";
import { defineEventHandler, readBody, getCookie } from "h3";

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

    if (!user.companyId) {
      throw createError({ statusCode: 400, statusMessage: "User is not linked to a company" });
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { businessCode: true, companyName: true },
    });

    if (!company?.businessCode) {
      throw createError({ statusCode: 404, statusMessage: "Company code not found" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send & Save
    for (const email of emails) {
      // Save invite
      await prisma.employeeInvite.create({
        data: {
          email,
          companyId: user.companyId,
        },
      });

      const signupLink = `https://www.businessbenefitalliance.com/register-employee`

      // Send email
      const { error } = await resend.emails.send({
        from: "noreply@updates.businessbenefitalliance.com",
        to: email,
        subject: `Your Company Code for ${company.companyName}`,
        html: `
          <p>Hello,</p>
          <p>Here is your company code for <b>${company.companyName}</b>:</p>
          <h2>${company.businessCode}</h2>

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
    console.error("Error sending mass invite:", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to send invites" });
  }
});
