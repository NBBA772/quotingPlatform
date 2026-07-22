import crypto from 'crypto'
import { readBody, createError } from 'h3'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from '~/server/database/client'
import { requireAuthUser, assertCanManageApplication, getApplicationOrThrow } from '~/server/utils/enrollmentAuth'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.AWS_S3_BUCKET!
const MAX_CODE_ATTEMPTS = 5

// Signature box coordinates must match the signature page drawn in generate-pdf
const SIG_BOX = { x: 50, y: 560, width: 280, height: 90 }

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const applicationId = Number((event.context.params as any).applicationId)
    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application id' })
    }

    const app = await getApplicationOrThrow(applicationId)
    await assertCanManageApplication(user, app.userId)

    if (!app.pdfUrl) {
      throw createError({ statusCode: 400, statusMessage: 'Generate the application PDF before signing' })
    }
    if (app.signedAt) {
      throw createError({ statusCode: 400, statusMessage: 'Application is already signed' })
    }

    // Payment comes before signing
    const payment = await prisma.payment.findFirst({
      where: { applicationId, status: { in: ['succeeded', 'authorized'] } },
      orderBy: { createdAt: 'desc' },
    })
    if (!payment) {
      throw createError({ statusCode: 400, statusMessage: 'Payment must be completed before signing' })
    }

    const body = await readBody(event)
    const method: 'signature' | 'code' = body.method

    if (method === 'code') {
      const code = String(body.code || '').trim()
      if (!/^\d{6}$/.test(code)) {
        throw createError({ statusCode: 400, statusMessage: 'Enter the 6-digit code' })
      }

      const record = await prisma.signatureCode.findFirst({
        where: { applicationId, usedAt: null, expiresAt: { gt: new Date() } },
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

    // Load the current (unsigned) PDF from S3
    const key = app.pdfUrl.split('.amazonaws.com/')[1]
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const existingBytes = Buffer.from(await obj.Body!.transformToByteArray())

    const pdfDoc = await PDFDocument.load(existingBytes)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const sigPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1)

    const signerName = [app.firstName, app.lastName].filter(Boolean).join(' ')
      || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    const signedDate = new Date()

    if (method === 'signature') {
      const pngBytes = Buffer.from(body.signatureDataUrl.split(',')[1], 'base64')
      const png = await pdfDoc.embedPng(pngBytes)
      // Fit the signature inside the box while keeping its aspect ratio
      const scale = Math.min((SIG_BOX.width - 10) / png.width, (SIG_BOX.height - 10) / png.height)
      sigPage.drawImage(png, {
        x: SIG_BOX.x + 5,
        y: SIG_BOX.y + 5,
        width: png.width * scale,
        height: png.height * scale,
      })
    } else {
      sigPage.drawText(`Electronically signed by ${signerName}`, {
        x: SIG_BOX.x + 10, y: SIG_BOX.y + 50, size: 12, font,
      })
      sigPage.drawText('via one-time 6-digit verification code', {
        x: SIG_BOX.x + 10, y: SIG_BOX.y + 34, size: 10, font, color: rgb(0.3, 0.3, 0.3),
      })
    }

    const ip = String(
      event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress || 'unknown',
    )
    sigPage.drawText(
      `Signed ${signedDate.toLocaleString('en-US')} — Method: ${method === 'code' ? '6-digit code' : 'drawn signature'} — IP: ${ip}`,
      { x: SIG_BOX.x, y: SIG_BOX.y - 30, size: 9, font, color: rgb(0.4, 0.4, 0.4) },
    )

    const signedBytes = Buffer.from(await pdfDoc.save())
    const documentHash = crypto.createHash('sha256').update(signedBytes).digest('hex')

    const signedKey = `applications/${app.id}-signed-${Date.now()}.pdf`
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: signedKey,
      Body: signedBytes,
      ContentType: 'application/pdf',
    }))
    const pdfUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${signedKey}`

    const updated = await prisma.insuranceApplication.update({
      where: { id: app.id },
      data: {
        pdfUrl,
        status: 'signed',
        signedAt: signedDate,
        signatureMethod: method,
      },
    })

    await prisma.applicationPdf.create({
      data: { applicationId: app.id, url: pdfUrl, kind: 'signed', signed: true },
    }).catch((e) => console.error('Failed to record signed PDF version:', e))

    await prisma.auditTrail.create({
      data: {
        userId: user.id,
        insuranceApplicationId: app.id,
        ip,
        signer: signerName,
        email: app.email || app.user?.email || '',
        documentHash,
        action: method === 'code' ? 'E-sign (6-digit code)' : 'E-sign (drawn signature)',
      },
    })

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: signedKey }),
      { expiresIn: 60 * 10 },
    )

    return { success: true, pdfUrl: updated.pdfUrl, downloadUrl, signedAt: updated.signedAt }
  } catch (err: any) {
    console.error('❌ Sign application error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to sign application',
    })
  }
})
