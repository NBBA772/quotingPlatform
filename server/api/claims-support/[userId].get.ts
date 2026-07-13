import { defineEventHandler } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.userId);
  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, message: "Invalid userId" });
  }

  const supports = await prisma.claimSupport.findMany({ where: { userId } });
  return { supports };
});
