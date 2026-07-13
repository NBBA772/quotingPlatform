// server/api/providers/index.post.ts
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id;
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const body = await readBody(event);

  return prisma.provider.create({
    data: {
      userId,
      networkId: body.networkId || null,
      name: body.name,
      specialty: body.specialty,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
    },
  });
});
