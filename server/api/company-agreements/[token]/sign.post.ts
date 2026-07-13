import crypto from 'crypto'
import { readBody, createError, getRequestURL } from 'h3'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from '~/server/database/client'
import { AGREEMENT_SIG_BOX } from '~/server/utils/companyAgreementPdf'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.AWS_S3_BUCKET!
const MAX_CODE_ATTEMPTS = 5

// Public endpoint: token-authenticated signing by the company contact.
export default defineEventHandler(async (event) => {
  try {
    const token = String((event.context.params as any).token || '')
    if (!/^[a-f0-9]{64}$/.test(token)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid review link' })
    }

    const agreement = await prisma.companyAgreement.findUnique({
      where: { reviewToken: token },
      include: { company: true, agent: true },
    })
    if (!agreement) {
      throw createError({ statusCode: 404, statusMessage: 'This review link is invalid or has been removed' })
    }
    if (agreement.status === 'signed') {
      throw createError({ statusCode: 400, statusMessage: 'This agreement is already signed' })
    }
    if (!agreement.pdfUrl) {
      throw createError({ statusCode: 400, statusMessage: 'Agreement PDF is not available' })
    }

    const body = await readBody(event)
    const method: 'signature' | 'code' = body.method

    if (method === 'code') {
      const code = String(body.code || '').trim()
      if (!/^\d{6}$/.test(code)) {
        throw createError({ statusCode: 400, statusMessage: 'Enter the 6-digit code' })
      }

      const record = await prisma.signatureCode.findFirst({
        where: { companyAgreementId: agreement.id, usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      })
      if (!record) {
        throw createError({ statusCode: 400, statusMessage: 'No active code. Request a new one.' })
      }
      if (record.attempts >= MAX_CODE_ATTEMPTS) {
        throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Request a new code.' })
      }

      const codeHash = crypto.createHash('sha256').update(code).digest('hex')
      if (codeHash !== record.codeHash) {
        await prisma.signatureCode.update({
          where: { id: record.id },
          data: { attempts: { increment: 1 } },
        })
        throw createError({ statusCode: 400, statusMessage: 'Incorrect code' })
      }

      await prisma.signatureCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      })
    } else if (method === 'signature') {
      if (!body.signatureDataUrl?.startsWith('data:image/png')) {
        throw createError({ statusCode: 400, statusMessage: 'Signature image is required' })
      }
    } else {
      throw createError({ statusCode: 400, statusMessage: 'Invalid signing method' })
    }

    // Load the unsigned PDF and stamp the signature page
    const key = agreement.pdfUrl.split('.amazonaws.com/')[1]
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const existingBytes = Buffer.from(await obj.Body!.transformToByteArray())

    const pdfDoc = await PDFDocument.load(existingBytes)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const sigPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1)

    const signerName = `${agreement.contactFirstName} ${agreement.contactLastName}`
    const signedDate = new Date()

    if (method === 'signature') {
      const pngBytes = Buffer.from(body.signatureDataUrl.split(',')[1], 'base64')
      const png = await pdfDoc.embedPng(pngBytes)
      const scale = Math.min(
        (AGREEMENT_SIG_BOX.width - 10) / png.width,
        (AGREEMENT_SIG_BOX.height - 10) / png.height,
      )
      sigPage.drawImage(png, {
        x: AGREEMENT_SIG_BOX.x + 5,
        y: AGREEMENT_SIG_BOX.y + 5,
        width: png.width * scale,
        height: png.height * scale,
      })
    } else {
      sigPage.drawText(`Electronically signed by ${signerName}`, {
        x: AGREEMENT_SIG_BOX.x + 10, y: AGREEMENT_SIG_BOX.y + 50, size: 12, font,
      })
      sigPage.drawText('via one-time 6-digit verification code', {
        x: AGREEMENT_SIG_BOX.x + 10, y: AGREEMENT_SIG_BOX.y + 34, size: 10, font, color: rgb(0.3, 0.3, 0.3),
      })
    }

    const ip = String(
      event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress || 'unknown',
    )
    sigPage.drawText(
      `Signed ${signedDate.toLocaleString('en-US')} — Method: ${method === 'code' ? '6-digit code' : 'drawn signature'} — IP: ${ip}`,
      { x: AGREEMENT_SIG_BOX.x, y: AGREEMENT_SIG_BOX.y - 30, size: 9, font, color: rgb(0.4, 0.4, 0.4) },
    )

    const signedBytes = Buffer.from(await pdfDoc.save())
    const documentHash = crypto.createHash('sha256').update(signedBytes).digest('hex')

    const signedKey = `company-agreements/${agreement.id}-signed-${Date.now()}.pdf`
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: signedKey,
      Body: signedBytes,
      ContentType: 'application/pdf',
    }))
    const pdfUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${signedKey}`

    await prisma.companyAgreement.update({
      where: { id: agreement.id },
      data: {
        pdfUrl,
        status: 'signed',
        signedAt: signedDate,
        signatureMethod: method,
      },
    })

    await prisma.auditTrail.create({
      data: {
        ip,
        signer: signerName,
        email: agreement.contactEmail,
        documentHash,
        action: method === 'code' ? 'Company agreement e-sign (6-digit code)' : 'Company agreement e-sign (drawn signature)',
        metadata: {
          companyAgreementId: agreement.id,
          companyId: agreement.companyId,
          companyName: agreement.company.companyName,
        },
      },
    })

    // The signer becomes the company's first employee: create the User +
    // Employee records (the User is what the enrollment flow works off).
    // Failures here must not undo the signing, so everything is best-effort.
    let employeeUserId: number | null = null
    let tempPassword: string | null = null
    try {
      let employeeUser = await prisma.user.findUnique({ where: { email: agreement.contactEmail } })

      if (!employeeUser) {
        tempPassword = crypto.randomBytes(8).toString('base64url')
        const hashed = await bcrypt.hash(tempPassword, 10)
        employeeUser = await prisma.user.create({
          data: {
            firstName: agreement.contactFirstName,
            lastName: agreement.contactLastName,
            email: agreement.contactEmail,
            phone: agreement.contactPhone || null,
            username: agreement.contactEmail,
            password: hashed,
            loginType: 'email',
            companyId: agreement.companyId,
          },
        })
      } else if (!employeeUser.companyId) {
        employeeUser = await prisma.user.update({
          where: { id: employeeUser.id },
          data: { companyId: agreement.companyId },
        })
      }
      employeeUserId = employeeUser.id

      const existingEmployee = await prisma.employee.findUnique({
        where: { email: agreement.contactEmail },
      })
      if (!existingEmployee) {
        await prisma.employee.create({
          data: {
            firstName: agreement.contactFirstName,
            lastName: agreement.contactLastName,
            email: agreement.contactEmail,
            phone: agreement.contactPhone || null,
            username: employeeUser.username || agreement.contactEmail,
            // keep employee credentials in step with the user record
            password: employeeUser.password || (await bcrypt.hash(crypto.randomBytes(8).toString('base64url'), 10)),
            companyId: agreement.companyId,
            userId: employeeUser.id,
          },
        })
      }
    } catch (err) {
      console.error('Failed to create employee for signer:', err)
    }

    const origin = process.env.BASE_URL || getRequestURL(event).origin
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Confirmation to the client — with login credentials if we just created them
    try {
      await resend.emails.send({
        from: 'noreply@updates.businessbenefitalliance.com',
        to: agreement.contactEmail,
        subject: `Signed: ${agreement.company.companyName} agreement`,
        html: `
          <p>Hello ${agreement.contactFirstName},</p>
          <p>Your agreement for <b>${agreement.company.companyName}</b>
          (Group #${agreement.company.businessCode}) was signed on ${signedDate.toLocaleString('en-US')}.
          A copy is kept on file.</p>
          ${tempPassword ? `
          <p>You've been added as a member of your company. You can log in at
          <a href="${origin}/login">${origin}/login</a> with:</p>
          <p>Email: <b>${agreement.contactEmail}</b><br/>
          Temporary password: <b>${tempPassword}</b></p>
          <p>Please change this password after your first login.</p>
          ` : ''}
        `,
      })
    } catch (err) {
      console.error('Failed to send signer confirmation email:', err)
    }

    // Let the agent know their client signed; failure here shouldn't fail the signing
    if (agreement.agent?.email) {
      try {
        await resend.emails.send({
          from: 'noreply@updates.businessbenefitalliance.com',
          to: agreement.agent.email,
          subject: `Signed: ${agreement.company.companyName} agreement`,
          html: `
            <p>Hello ${agreement.agent.firstName},</p>
            <p><b>${signerName}</b> signed the company agreement for
            <b>${agreement.company.companyName}</b> (Group #${agreement.company.businessCode})
            on ${signedDate.toLocaleString('en-US')}.</p>
            <p>The signed PDF is saved on the agreement record.</p>
            ${employeeUserId ? `
            <p>${signerName} has been added as the company's first employee.
            Start their insurance application here:
            <a href="${origin}/enroll/${employeeUserId}/plan">${origin}/enroll/${employeeUserId}/plan</a></p>
            ` : ''}
          `,
        })
      } catch (err) {
        console.error('Failed to notify agent of signing:', err)
      }
    }

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: signedKey }),
      { expiresIn: 60 * 15 },
    )

    return { success: true, downloadUrl, signedAt: signedDate }
  } catch (err: any) {
    console.error('❌ Agreement sign error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to sign agreement',
    })
  }
})
