import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { underwritingProducts } from '~/utils/underwritingQuestions'

// Payment authorization record for MANUAL processing while ePayPolicy API
// access is pending. Includes the full application details plus the payment
// information the office needs to key the transaction — treat these PDFs as
// sensitive and delete after processing.

interface PaymentAuthPdfInput {
  invoice: string
  application: any // InsuranceApplication with ancillaryPlans + dependents + user
  breakdown: { label: string; amount: number; oneTime?: boolean }[]
  amount: number
  method: 'card' | 'ach'
  card?: {
    accountHolder: string
    cardNumber: string
    cvc: string
    month: number
    year: number
    postalCode?: string
  }
  bank?: {
    accountHolder: string
    accountType: string
    routingNumber: string
    accountNumber: string
  }
  ip: string
}

export async function buildPaymentAuthPdf(input: PaymentAuthPdfInput): Promise<Uint8Array> {
  const app = input.application

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

  const fmtDate = (val: any) => (val ? new Date(val).toLocaleDateString('en-US') : null)

  // Header
  page.drawText('Payment Authorization — Manual Processing', { x: margin, y, size: 18, font: bold })
  y -= 14
  page.drawText(`Invoice ${input.invoice} — Recorded ${new Date().toLocaleString('en-US')}`, {
    x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4),
  })
  y -= 12
  page.drawText('CONFIDENTIAL: contains payment card/bank data. Destroy after the transaction is processed.', {
    x: margin, y, size: 9, font: bold, color: rgb(0.8, 0.1, 0.1),
  })
  y -= 10

  // ── Application details ──
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
  line('Email', app.email || app.user?.email)
  line('Phone', app.phoneNumber)
  line('Address', [app.streetAddress, app.city, app.state, app.zipCode].filter(Boolean).join(', '))
  line('Date of Birth', fmtDate(app.dateOfBirth))
  line('Gender', app.gender)
  line('Height / Weight', [app.height, app.weight].filter(Boolean).join(' / ') || null)

  if (app.spouseFirstName || app.spouseLastName) {
    heading('Spouse')
    line('Name', [app.spouseFirstName, app.spouseMiddleName, app.spouseLastName].filter(Boolean).join(' '))
    line('Date of Birth', fmtDate(app.spouseDateOfBirth))
    line('Gender', app.spouseGender)
  }

  if (app.dependents?.length) {
    heading('Dependents')
    for (const dep of app.dependents) {
      line(
        dep.relationship || 'Dependent',
        `${[dep.firstName, dep.lastName].filter(Boolean).join(' ')} — DOB ${fmtDate(dep.dateOfBirth) || '—'}, ${dep.gender || '—'}`,
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
  if (app.ancillaryPlans?.length) {
    for (const plan of app.ancillaryPlans) {
      line(
        'Ancillary',
        `${plan.planName || '—'} — ${plan.product || '—'}${plan.price != null ? ` ($${plan.price.toFixed(2)}/mo)` : ''}`,
      )
    }
  }

  const answers = (app.underwritingAnswers as any) || {}
  const answeredProducts = underwritingProducts.filter((p) => answers[p.key])
  if (answeredProducts.length) {
    heading('Underwriting Questions')
    for (const product of answeredProducts) {
      ensureRoom(20)
      page.drawText(product.label, { x: margin, y, size: 11, font: bold })
      y -= 16
      for (const q of product.questions) {
        const a = answers[product.key][q.id]
        if (a === undefined) continue
        wrapped(q.text, 10, font)
        const answerText = a?.answer === true ? 'Yes' : a?.answer === false ? 'No' : String(a?.answer ?? '—')
        wrapped(`Answer: ${answerText}${a?.details ? ` — ${a.details}` : ''}`, 10, bold, 12)
        y -= 4
      }
      y -= 6
    }
  }

  // ── Payment details ──
  heading('Amount Authorized')
  for (const item of input.breakdown) {
    line(item.label, `$${item.amount.toFixed(2)}${item.oneTime ? ' (one-time)' : '/mo'}`)
  }
  line('Total amount authorized', `$${input.amount.toFixed(2)}`)
  line('Processing fee', 'Per ePayPolicy schedule at time of processing')

  if (input.method === 'card' && input.card) {
    heading('Credit Card')
    line('Name on Card', input.card.accountHolder)
    line('Card Number', input.card.cardNumber)
    line('Expiration', `${String(input.card.month).padStart(2, '0')}/${input.card.year}`)
    line('CVC', input.card.cvc)
    line('Billing ZIP', input.card.postalCode)
  } else if (input.bank) {
    heading('Bank Account (ACH)')
    line('Account Holder', input.bank.accountHolder)
    line('Account Type', input.bank.accountType)
    line('Routing Number', input.bank.routingNumber)
    line('Account Number', input.bank.accountNumber)
  }

  heading('Authorization')
  wrapped(
    'The applicant entered these payment details and authorized a charge of the monthly premium ' +
      `plus applicable processing fees. Recorded electronically from IP ${input.ip}.`,
  )
  ensureRoom(50)
  y -= 30
  page.drawText('Processed by: ____________________    Date: ____________    Transaction #: ____________________', {
    x: margin, y, size: 10, font,
  })

  return pdfDoc.save()
}
