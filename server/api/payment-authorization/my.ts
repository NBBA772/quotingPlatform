import prisma from "~/server/database/client";
import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, "auth_token");
  if (!authToken)
    throw createError({ statusCode: 401, message: "Unauthorized" });

  // Get session and user with payment authorizations
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: { include: { paymentAuthorizations: true } } },
  });


  if (!session?.user)
    throw createError({ statusCode: 401, message: "Unauthorized" });

  // Fetch user's payment authorizations
  const paymentAuthorizations = await prisma.paymentAuthorization.findMany({
    where: { userId: session.user.id },
  });


  return paymentAuthorizations;
});
