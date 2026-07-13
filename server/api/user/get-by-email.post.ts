import { createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: String(email) },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    return user;
  } catch (err: any) {
    console.error("Error fetching user by email:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
});
