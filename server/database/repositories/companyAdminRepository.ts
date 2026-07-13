import prisma from "~/server/database/client";

export async function createCompanyAdmin(data: any) {
  return prisma.companyAdmin.create({ data });
}
