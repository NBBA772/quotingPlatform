import { createError } from 'h3';
import prisma from '~/server/database/client';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { inviteId } = body;

  if (!inviteId) throw createError({ statusCode: 400, statusMessage: 'Invite ID required' });

  const updated = await prisma.leadInvite.update({
    where: { id: Number(inviteId) },
    data: { acceptedAt: new Date() },
  });

  return updated;
});
