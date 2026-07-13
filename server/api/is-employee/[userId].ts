import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'userId'))
  if (isNaN(id)) return { isEmployee: false }

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
  })

  return { isEmployee: !!employee }
})
