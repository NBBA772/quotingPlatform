import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params.userId);
  const plan = await prisma.plan.findFirst({ where: { userId } });
  return { plan };
});
