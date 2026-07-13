import { z } from 'zod'
import prisma from '~/server/database/client'

// Input validation schema
const SeoRequestSchema = z.object({
  pageUrl: z.string().url(),
  description: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const authToken = getCookie(event, "auth_token");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // Look up session in database
    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { companyAdmin: true, user: true },
    });

    if (!session) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // Determine the company ID: allow either user with company or companyAdmin
    let companyId: number | null = null;

    if (session.user?.companyId) {
      companyId = session.user.companyId;
    } else if (session.companyAdmin?.companyId) {
      companyId = session.companyAdmin.companyId;
    } else {
      throw createError({
        statusCode: 403,
        message: "Forbidden: Only companies or company admins can request SEO",
      });
    }

    // Parse request body
    const body = await readBody(event)
    const data = SeoRequestSchema.parse(body)

    // Save to database
    const seoRequest = await prisma.sEORequest.create({
      data: {
        pageUrl: data.pageUrl,
        description: data.description || '',
        companyId,
        status: 'PENDING',
        requestedAt: new Date(),
      },
    })

    return {
      message: 'SEO request submitted successfully',
      seoRequest,
    }

  } catch (err: any) {
    console.error(err)
    if (err instanceof z.ZodError) {
      throw createError({ statusCode: 400, message: err.errors.map(e => e.message).join(', ') })
    }
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'Internal Server Error' })
  }
})
