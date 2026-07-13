import prisma from "~/server/database/client";
import { defineEventHandler, getRouterParam, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id")); // same pattern as insurance card
    if (!id) throw createError({ statusCode: 400, message: "Invalid user ID" });

    // Fetch the user's claimSupports and benefits
    const claimSupports = await prisma.claimSupports.findFirst({
      where: { userId: id },
      include: { benefits: true },
    });

    if (!claimSupports) return { benefits: [] };

    const benefits = claimSupports.benefits.map(b => ({
      name: b.name,
      description: b.description,
    }));

    return { benefits };
  } catch (error: any) {
    console.error("❌ Fetch claimSupports benefits error:", error);
    throw createError({ statusCode: 500, message: error.message || "Failed to fetch claimSupports benefits" });
  }
});
