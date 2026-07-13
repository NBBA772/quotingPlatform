import { defineEventHandler, getRouterParams, readBody, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const { planId } = getRouterParams(event);

    if (!planId || isNaN(Number(planId))) {
      throw createError({ statusCode: 400, message: "Invalid plan ID" });
    }

    const body = await readBody(event);
    const { name, description } = body;

    if (!name || !description) {
      throw createError({ statusCode: 400, message: "Name and description required" });
    }

    const benefit = await prisma.benefit.create({
      data: {
        planId: Number(planId),
        name,
        description,
      },
    });

    return { success: true, benefit };
  } catch (err: any) {
    console.error("Error adding benefit:", err.message || err);
    throw createError({ statusCode: 500, message: "Failed to add benefit" });
  }
});
