import prisma from "~/server/database/client"
import bcrypt from "bcryptjs"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.email || !body.username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" })
  }

  const hashedPassword = await bcrypt.hash(body.password, 10)

  return await prisma.insuranceAgent.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      username: body.username,
      password: hashedPassword,
    },
  })
})
