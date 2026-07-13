import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getCookie, createError } from 'h3'
import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default defineEventHandler(async (event) => {
  try {
    const authToken = getCookie(event, 'auth_token')
    if (!authToken) throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })

    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid session' })

    const { id } = event.context.params as { id: string }
    const application = await prisma.insuranceApplication.findUnique({
      where: { id: Number(id) }
    })

    if (!application) throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    if (application.userId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Not allowed to access this application' })
    if (!application.pdfUrl) throw createError({ statusCode: 400, statusMessage: 'PDF not available' })

    // Extract key from URL
    const key = application.pdfUrl.split(`.amazonaws.com/`)[1]

    const command = new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key })
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutes

    return { url }

  } catch (err: any) {
    console.error(err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to generate signed URL' })
  }
})
