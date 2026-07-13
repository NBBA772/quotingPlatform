// /api/leads/[id]/delete.ts
import prisma from "~/server/database/client";
import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id) return { error: 'Invalid lead id' }

  try {
    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    return { success: true }
  } catch (err) {
    console.error('Failed to soft delete lead:', err)
    return { error: 'Failed to delete lead' }
  }
})
