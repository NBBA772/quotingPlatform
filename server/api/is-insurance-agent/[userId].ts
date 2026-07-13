import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'userId'))
  if (isNaN(id)) return { isAgent: false }

  const agent = await prisma.insuranceAgent.findUnique({
    where: { userId: id },
  })

  return { isAgent: !!agent }
})
