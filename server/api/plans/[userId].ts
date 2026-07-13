import { defineEventHandler, getQuery, readBody } from 'h3';
import prisma from '~/server/database/client';
/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Get a plan by ID
 *     tags:
 *       - Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 planName:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 benefits:
 *                   type: array
 *                   items:
 *                     type: object
 */

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.userId);
  if (!userId) return { error: 'Missing userId' };

  if (event.req.method === 'GET') {
    // Fetch the user's plan with benefits
    const plans = await prisma.plan.findMany({
      where: { userId },
      include: { benefits: true },
    });
    return { plans };
  }

  if (event.req.method === 'POST') {
    const body = await readBody(event);
    const { planName, planType, benefits } = body;

    // Check if a plan already exists for this user
    let plan = await prisma.plan.findFirst({ where: { userId } });

    if (!plan) {
      // Create new plan
      plan = await prisma.plan.create({
        data: {
          userId,
          planName,
          planType,
          benefits: {
            create: benefits.map((b: any) => ({
              name: b.name,
              description: b.description,
            })),
          },
        },
        include: { benefits: true },
      });
    } else {
      // Update existing plan and replace benefits
      await prisma.benefit.deleteMany({ where: { planId: plan.id } });

      plan = await prisma.plan.update({
        where: { id: plan.id },
        data: {
          planName,
          planType,
          benefits: {
            create: benefits.map((b: any) => ({
              name: b.name,
              description: b.description,
            })),
          },
        },
        include: { benefits: true },
      });
    }

    return { plan };
  }

  return { error: 'Method not allowed' };
});
