import { createError } from 'h3'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Admin-only signed URL for a payment-authorization PDF (contains payment details)
export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  if (!user.appAdminId) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const id = Number((event.context.params as any).id)
  const payment = await prisma.payment.findUnique({ where: { id } })
  if (!payment?.pdfUrl) {
    throw createError({ statusCode: 404, statusMessage: 'No PDF for this payment' })
  }

  const key = payment.pdfUrl.split('.amazonaws.com/')[1]
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }),
    { expiresIn: 60 * 5 },
  )
  return { url }
})
