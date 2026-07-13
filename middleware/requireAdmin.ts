// server/middleware/requireAdmin.ts
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";
import prisma from "~/server/database/client";
import { getHeader, createError } from "h3";

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
  if (!authToken) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const user = await getUserByAuthToken(authToken);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // check if they're an admin
  const admin = await prisma.appAdmin.findUnique({
    where: { userId: user.id },
  });

  if (!admin) {
    throw createError({ statusCode: 403, message: "Forbidden: Admin only" });
  }

  // allow request
  event.context.user = user;
  event.context.isAdmin = true;
});
