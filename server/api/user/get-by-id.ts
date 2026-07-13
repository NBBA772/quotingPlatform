// server/api/user/get-by-id.post.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id } = body

    if (!id) {
      return sendError(event, createError({ statusCode: 400, statusMessage: "Missing user ID" }))
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        invites: true, // include invites if you want acceptedAt info
      },
    })

    if (!user) {
      return sendError(event, createError({ statusCode: 404, statusMessage: "User not found" }))
    }

    return user
  } catch (err: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: err.message || "Internal Server Error" }))
  }
})
