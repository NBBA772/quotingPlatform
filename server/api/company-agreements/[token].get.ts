import { createError } from 'h3'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from '~/server/database/client'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.AWS_S3_BUCKET!

// Public endpoint: the unguessable review token is the credential.
export default defineEventHandler(async (event) => {
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

  let previewUrl: string | null = null
  if (agreement.pdfUrl) {
    const key = agreement.pdfUrl.split('.amazonaws.com/')[1]
    previewUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 60 * 15 },
    )
  }

  const { company, agent } = agreement
  return {
    status: agreement.status,
    signedAt: agreement.signedAt,
    previewUrl,
    contact: {
      firstName: agreement.contactFirstName,
      lastName: agreement.contactLastName,
      // masked hints for the code-delivery choice
      emailMasked: agreement.contactEmail.replace(/^(.).*(@.*)$/, '$1•••$2'),
      phoneMasked: agreement.contactPhone ? agreement.contactPhone.replace(/\d(?=\d{4})/g, '•') : null,
    },
    company: {
      companyName: company.companyName,
      ein: company.ein,
      industry: company.industry,
      streetAddress: company.streetAddress,
      city: company.city,
      state: company.state,
      zipCode: company.zipCode,
      phoneNumber: company.phoneNumber,
      companyEmail: company.companyEmail,
      website: company.website,
      employeeSize: company.employeeSize,
      businessCode: company.businessCode,
    },
    agentName: agent ? `${agent.firstName} ${agent.lastName}` : null,
  }
})
