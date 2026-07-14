// server/api/admin/reset-agents.post.ts
import { defineEventHandler } from 'h3';
import prisma from '~/server/database/client';

export default defineEventHandler(async () => {
  // Set all agents to unavailable
  const updated = await prisma.insuranceAgent.updateMany({
    data: { isAvailable: false },
  });

  return { success: true, updated: updated.count };
});
