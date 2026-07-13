import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";
import { getHeader, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, "authorization");
    console.log("🔹 Auth Header:", authHeader);

    if (!authHeader) {
      console.error("❌ No Authorization header found");
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    console.log("🔹 Token extracted:", token);

    const session = await getUserByAuthToken(token);
    console.log("🔹 Session from token:", session);

    if (!session) {
      console.error("❌ Invalid or expired session");
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // ✅ Check if user is a company admin
    if (!session.companyAdminId) {
      console.error("❌ User is not a company admin");
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const employees = await prisma.employee.findMany({
      where: { companyId: session.companyId, isActive: true },
      orderBy: { order: "asc" },   // 👈 ensure correct order
    });

    console.log("✅ Employees fetched:", employees.length);
    return employees;
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    throw error;
  }
});
