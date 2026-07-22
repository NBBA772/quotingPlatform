import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createError } from 'h3'
import prisma from '~/server/database/client'
import { requireAuthUser, assertCanManageApplication, getApplicationOrThrow } from '~/server/utils/enrollmentAuth'
import { underwritingProducts } from '~/utils/underwritingQuestions'
import { ONE_TIME_ENROLLMENT_FEE } from '~/utils/enrollmentFee'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.AWS_S3_BUCKET!

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)

    const applicationId = Number((event.context.params as any).applicationId)
    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application id' })
    }

    const app = await getApplicationOrThrow(applicationId)
    await assertCanManageApplication(user, app.userId)

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const pageSize: [number, number] = [612, 792]
    const margin = 50
    let page = pdfDoc.addPage(pageSize)
    let y = pageSize[1] - margin

    const ensureRoom = (needed: number) => {
      if (y - needed < margin) {
        page = pdfDoc.addPage(pageSize)
        y = pageSize[1] - margin
      }
    }

    const heading = (text: string) => {
      ensureRoom(30)
      y -= 10
      page.drawText(text, { x: margin, y, size: 14, font: bold, color: rgb(0.02, 0.4, 0.22) })
      y -= 20
    }

    const line = (label: string, value: string | null | undefined) => {
      ensureRoom(16)
      page.drawText(`${label}: ${value ?? '—'}`, { x: margin, y, size: 10, font })
      y -= 16
    }

    // Wraps long question/answer text to fit the page width
    const wrapped = (text: string, size = 10, useFont = font, indent = 0) => {
      const maxWidth = pageSize[0] - margin * 2 - indent
      const words = text.split(' ')
      let current = ''
      const lines: string[] = []
      for (const word of words) {
        const attempt = current ? `${current} ${word}` : word
        if (useFont.widthOfTextAtSize(attempt, size) > maxWidth) {
          if (current) lines.push(current)
          current = word
        } else {
          current = attempt
        }
      }
      if (current) lines.push(current)
      for (const l of lines) {
        ensureRoom(14)
        page.drawText(l, { x: margin + indent, y, size, font: useFont })
        y -= 14
      }
    }

    page.drawText('Insurance Enrollment Application', { x: margin, y, size: 18, font: bold })
    y -= 14
    page.drawText(`Application #${app.id} — Generated ${new Date().toLocaleDateString('en-US')}`, {
      x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4),
    })
    y -= 10

    const tierLabels: Record<string, string> = {
      single: 'Single',
      individual_spouse: 'Individual and Spouse',
      individual_child: 'Individual and Child',
      family: 'Family',
    }

    heading('Enrollee')
    line('NPN', app.groupNumber)
    line('Agent Name', app.groupName)
    line('Coverage', app.coverageTier ? tierLabels[app.coverageTier] || app.coverageTier : null)

    heading('Applicant')
    line('Name', [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' '))
    line('Email', app.email)
    line('Phone', app.phoneNumber)
    line('Address', [app.streetAddress, app.city, app.state, app.zipCode].filter(Boolean).join(', '))
    line('Date of Birth', app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString('en-US') : null)
    line('Gender', app.gender)
    line('Height / Weight', [app.height, app.weight].filter(Boolean).join(' / ') || null)

    if (app.spouseFirstName || app.spouseLastName) {
      heading('Spouse')
      line('Name', [app.spouseFirstName, app.spouseMiddleName, app.spouseLastName].filter(Boolean).join(' '))
      line('Date of Birth', app.spouseDateOfBirth ? new Date(app.spouseDateOfBirth).toLocaleDateString('en-US') : null)
      line('Gender', app.spouseGender)
    }

    if (app.dependents.length) {
      heading('Dependents')
      for (const dep of app.dependents) {
        line(
          dep.relationship || 'Dependent',
          `${[dep.firstName, dep.lastName].filter(Boolean).join(' ')} — DOB ${dep.dateOfBirth ? new Date(dep.dateOfBirth).toLocaleDateString('en-US') : '—'}, ${dep.gender || '—'}`,
        )
      }
    }

    heading('Plan Selections')
    line('Health Plan', app.healthPlan)
    line('Health Plan Price', app.healthPlanPrice != null ? `$${app.healthPlanPrice.toFixed(2)}/mo` : null)
    line('Dental & Vision', app.visionAndDentalPlan ? 'Yes' : 'No')
    if (app.visionAndDentalPlan) {
      line('Dental & Vision Price', app.visionAndDentalPrice != null ? `$${app.visionAndDentalPrice.toFixed(2)}/mo` : null)
    }
    if (app.ancillaryPlans.length) {
      for (const plan of app.ancillaryPlans) {
        line(
          'Ancillary',
          `${plan.planName || '—'} — ${plan.product || '—'}${plan.price != null ? ` ($${plan.price.toFixed(2)}/mo)` : ''}`,
        )
      }
    } else {
      line('Ancillary', 'None')
    }
    line(
      'One-Time Enrollment Fee',
      app.waiveOneTimeFee === true ? 'Waived' : `$${ONE_TIME_ENROLLMENT_FEE.toFixed(2)} (added to first payment)`,
    )

    // Payment happens before signing, so the record exists when this prints
    const latestPayment = await prisma.payment.findFirst({
      where: { applicationId: app.id, status: { in: ['succeeded', 'authorized'] } },
      orderBy: { createdAt: 'desc' },
    })
    heading('Payment')
    if (latestPayment) {
      line('Status', latestPayment.status === 'succeeded' ? 'Paid' : 'Authorized — pending processing')
      line('Amount', `$${latestPayment.amount.toFixed(2)}`)
      line('Method', latestPayment.method === 'ach' ? 'Bank account (ACH)' : 'Credit card')
      line('Date', new Date(latestPayment.createdAt).toLocaleString('en-US'))
      if (latestPayment.transactionId) line('Transaction #', latestPayment.transactionId)
      line('Invoice', latestPayment.invoice)
    } else {
      line('Status', 'Not yet paid')
    }


    // Underwriting Q&A: answers are stored as { productKey: { questionId: { answer, details } } }
    const answers = (app.underwritingAnswers as any) || {}
    heading('Underwriting Questions')
    let printedAny = false
    for (const product of underwritingProducts) {
      const productAnswers = answers[product.key]
      if (!productAnswers) continue
      printedAny = true
      ensureRoom(20)
      page.drawText(product.label, { x: margin, y, size: 11, font: bold })
      y -= 16
      for (const q of product.questions) {
        const a = productAnswers[q.id]
        if (a === undefined) continue
        wrapped(q.text, 10, font)
        const answerText = a?.answer === true ? 'Yes' : a?.answer === false ? 'No' : String(a?.answer ?? '—')
        wrapped(`Answer: ${answerText}${a?.details ? ` — ${a.details}` : ''}`, 10, bold, 12)
        y -= 4
      }
      y -= 6
    }
    if (!printedAny) {
      line('Underwriting', 'No responses recorded')
    }

    // Manual processing: merge in the payment-authorization pages, which
    // carry the card/bank details the office needs to run the charge.
    // They go before the signature page so signing still stamps the last page.
    if (latestPayment?.pdfUrl) {
      try {
        const authKey = latestPayment.pdfUrl.split('.amazonaws.com/')[1]
        const authObj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: authKey }))
        const authBytes = Buffer.from(await authObj.Body!.transformToByteArray())
        const authDoc = await PDFDocument.load(authBytes)
        const authPages = await pdfDoc.copyPages(authDoc, authDoc.getPageIndices())
        for (const p of authPages) pdfDoc.addPage(p)
      } catch (err) {
        console.error('Failed to merge payment authorization pages:', err)
      }
    }

    // Dedicated signature page at fixed coordinates — the sign-complete
    // endpoint stamps the signature (or code attestation) into this box.
    const sigPage = pdfDoc.addPage(pageSize)
    sigPage.drawText('Signature', { x: margin, y: 720, size: 14, font: bold, color: rgb(0.02, 0.4, 0.22) })
    sigPage.drawText(
      'By signing below (or by entering the one-time code sent to you), I certify that the information',
      { x: margin, y: 695, size: 10, font },
    )
    sigPage.drawText(
      'in this application is true and complete, and I consent to sign this document electronically.',
      { x: margin, y: 681, size: 10, font },
    )
    sigPage.drawRectangle({
      x: margin, y: 560, width: 280, height: 90,
      borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 1,
    })
    sigPage.drawText('Applicant signature', { x: margin, y: 546, size: 9, font, color: rgb(0.4, 0.4, 0.4) })

    const pdfBytes = await pdfDoc.save()

    const fileKey = `applications/${app.id}-unsigned-${Date.now()}.pdf`
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      Body: Buffer.from(pdfBytes),
      ContentType: 'application/pdf',
    }))
    const pdfUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileKey}`

    const updated = await prisma.insuranceApplication.update({
      where: { id: app.id },
      data: { pdfUrl, status: 'pdf_generated' },
    })

    // Keep a version history so edits/regenerations don't lose the prior PDF.
    await prisma.applicationPdf.create({
      data: { applicationId: app.id, url: pdfUrl, kind: 'unsigned', signed: false },
    }).catch((e) => console.error('Failed to record PDF version:', e))

    const previewUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: fileKey }),
      { expiresIn: 60 * 10 },
    )

    return { success: true, pdfUrl: updated.pdfUrl, previewUrl }
  } catch (err: any) {
    console.error('❌ Generate PDF error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to generate PDF',
    })
  }
})
