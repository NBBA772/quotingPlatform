import { defineEventHandler, getRouterParams, readBody, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const { userId } = getRouterParams(event);
    if (!userId || isNaN(Number(userId))) {
      throw createError({ statusCode: 400, message: "Invalid user ID" });
    }

    const body = await readBody(event); // expects { planName, planType, benefits: [{name, description}] }

    if (!body.planName) throw createError({ statusCode: 400, message: "Missing plan name" });

    // create plan
    const plan = await prisma.plan.create({
      data: {
        userId: Number(userId),
        planName: body.planName,
        planType: body.planType,
        benefits: {
          create: body.benefits || [],
        },
      },
      include: { benefits: true },
    });

    return { plan };
  } catch (err: any) {
    console.error("Error saving plan:", err);
    throw createError({ statusCode: 500, message: "Failed to save plan" });
  }
});
