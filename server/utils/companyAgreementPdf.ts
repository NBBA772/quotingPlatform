import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Signature box coordinates on the final page. The sign endpoint stamps the
// signature into this exact box, so keep the two in sync via this constant.
export const AGREEMENT_SIG_BOX = { x: 50, y: 560, width: 280, height: 90 }

interface AgreementPdfInput {
  agreementId: number
  company: {
    companyName: string
    ein?: string | null
    industry: string
    streetAddress: string
    city: string
    state: string
    zipCode: string
    phoneNumber: string
    companyEmail: string
    website?: string | null
    employeeSize: string
    businessCode?: string | null
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone?: string | null
  }
  agentName?: string | null
}

export async function buildCompanyAgreementPdf(input: AgreementPdfInput): Promise<Uint8Array> {
  const { company, contact } = input

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageSize: [number, number] = [612, 792]
  const margin = 50
  const page = pdfDoc.addPage(pageSize)
  let y = pageSize[1] - margin

  const heading = (text: string) => {
    y -= 10
    page.drawText(text, { x: margin, y, size: 14, font: bold, color: rgb(0.02, 0.4, 0.22) })
    y -= 20
  }

  const line = (label: string, value: string | null | undefined) => {
    page.drawText(`${label}: ${value ?? '—'}`, { x: margin, y, size: 10, font })
    y -= 16
  }

  page.drawText('Company Enrollment Agreement', { x: margin, y, size: 18, font: bold })
  y -= 14
  page.drawText(`Agreement #${input.agreementId} — Prepared ${new Date().toLocaleDateString('en-US')}`, {
    x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4),
  })
  y -= 10

  heading('Company')
  line('Company Name', company.companyName)
  line('EIN', company.ein)
  line('Industry', company.industry)
  line('Address', [company.streetAddress, company.city, company.state, company.zipCode].filter(Boolean).join(', '))
  line('Phone', company.phoneNumber)
  line('Email', company.companyEmail)
  line('Website', company.website)
  line('Employee Count', company.employeeSize)
  line('Group #', company.businessCode)

  heading('Primary Contact')
  line('Name', `${contact.firstName} ${contact.lastName}`)
  line('Email', contact.email)
  line('Phone', contact.phone)

  if (input.agentName) {
    heading('Prepared By')
    line('Insurance Agent', input.agentName)
  }

  // Dedicated signature page at fixed coordinates
  const sigPage = pdfDoc.addPage(pageSize)
  sigPage.drawText('Authorization & Signature', { x: margin, y: 720, size: 14, font: bold, color: rgb(0.02, 0.4, 0.22) })
  sigPage.drawText(
    'I certify that the information above is accurate, that I am authorized to act on behalf of the',
    { x: margin, y: 695, size: 10, font },
  )
  sigPage.drawText(
    'company named in this agreement, and I consent to sign this document electronically.',
    { x: margin, y: 681, size: 10, font },
  )
  sigPage.drawRectangle({
    x: AGREEMENT_SIG_BOX.x,
    y: AGREEMENT_SIG_BOX.y,
    width: AGREEMENT_SIG_BOX.width,
    height: AGREEMENT_SIG_BOX.height,
    borderColor: rgb(0.6, 0.6, 0.6),
    borderWidth: 1,
  })
  sigPage.drawText('Authorized signature', {
    x: AGREEMENT_SIG_BOX.x, y: AGREEMENT_SIG_BOX.y - 14, size: 9, font, color: rgb(0.4, 0.4, 0.4),
  })

  return pdfDoc.save()
}
