// server/api/leads/[id].put.ts
import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const body = await readBody(event);

  if (!id) throw createError({ statusCode: 400, message: "Missing lead ID" });

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      policyType: body.policyType,
      status: body.status,
    },
  });

  return { success: true, lead: updated };
});
