import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.userId);
  const body = await readBody(event);

  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, message: "Invalid userId" });
  }

  try {
    // Remove old supports
    await prisma.claimSupport.deleteMany({ where: { userId } });

    // Add new ones
    const newSupports = await prisma.claimSupport.createMany({
      data: body.map((s: any) => ({
        userId,
        type: s.type,
        paidAmount: s.paidAmount || 0,
        maxCoverage: s.maxCoverage || null,
        phone: s.phone || null,
        email: s.email || null,
        portalUrl: s.portalUrl || null,
        officeHours: s.officeHours || null,
      })),
    });

    return { success: true, count: newSupports.count, supports: body };
  } catch (err: any) {
    console.error("Error saving claim supports:", err);
    throw createError({ statusCode: 500, message: "Failed to save claim supports" });
  }
});
