// /api/user/[id]/insurance-card/[cardId].delete.ts
import prisma from "~/server/database/client";
import { defineEventHandler, getRouterParam, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const userId = Number(getRouterParam(event, "id"));       // <-- match [id]
    const cardId = Number(getRouterParam(event, "cardId"));  // <-- match [cardId]

    if (!userId || !cardId) throw createError({ statusCode: 400, message: "Invalid IDs" });

    // Verify card belongs to user
    const card = await prisma.insuranceCard.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== userId) {
      throw createError({ statusCode: 404, message: "Card not found" });
    }

    await prisma.insuranceCard.delete({ where: { id: cardId } });

    return { success: true };
  } catch (err: any) {
    console.error("Delete card error:", err);
    throw createError({ statusCode: err.statusCode || 500, message: err.message || "Failed to delete card" });
  }
});
