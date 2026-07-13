import prisma from "~/server/database/client";
import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, "auth_token");
  if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" });

  // Get session and user
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true },
  });

  if (!session?.user) throw createError({ statusCode: 401, message: "Unauthorized" });

  const userId = session.user.id;

  // Fetch all payment authorizations for this user
  const authorizations = await prisma.paymentAuthorization.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return authorizations;
});
