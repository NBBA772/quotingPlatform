import { defineEventHandler, readBody } from 'h3';
import prisma from '~/server/database/client';

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.userId);
  if (!userId) throw createError({ statusCode: 400, message: 'Invalid userId' });

  if (event.req.method === 'GET') {
    const plan = await prisma.plan.findFirst({ where: { userId } });
    return { plan };
  }

  if (event.req.method === 'POST') {
    const body = await readBody(event);
    const {
      planName,
      planType,
      coverageStart,
      coverageEnd,
      networkType,
      primaryCareRequired,
      referralRequired,
      outOfNetwork,
    } = body;

    const planData = {
      planName,
      planType: planType || null,
      coverageStart: coverageStart ? new Date(coverageStart) : null,
      coverageEnd: coverageEnd ? new Date(coverageEnd) : null,
      networkType: networkType || null,
      primaryCareRequired: primaryCareRequired ?? null,
      referralRequired: referralRequired ?? null,
      outOfNetwork: outOfNetwork ?? null,
    };

    // Find or create/update plan
    let plan = await prisma.plan.findFirst({ where: { userId } });

    if (plan) {
      plan = await prisma.plan.update({ where: { id: plan.id }, data: planData });
    } else {
      plan = await prisma.plan.create({ data: { ...planData, userId } });
    }

    return { plan };
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
