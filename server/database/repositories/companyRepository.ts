import { Company } from "@prisma/client";
import prisma from "~/server/database/client";
import { ICompany } from "~/types/ICompany";

export async function createCompany(data: ICompany, adminId?: number): Promise<Company> {
  return await prisma.company.create({
    data: {
      companyName: data.companyName,
      ein: data.ein,
      salesmanCode: data.salesmanCode,
      industry: data.industry,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phoneNumber: data.phoneNumber,
      companyEmail: data.companyEmail,
      website: data.website,
      employeeSize: data.employeeSize,
      // link the admin via the relation
      administrators: adminId ? {
        create: { userId: adminId, role: 'ADMIN' } // assuming CompanyAdministrator has userId and role
      } : undefined,
    },
    include: { administrators: true }, // optional, to return admin info
  })
}




export async function getCompanyById(id: number): Promise<Company | null> {
  return await prisma.company.findUnique({
    where: { id },
    include: {
      admin: true, // ✅ if you want to fetch the linked user/admin
    },
  });
}

export async function getCompanyByName(name: string): Promise<Company | null> {
  return await prisma.company.findFirst({
    where: { name },
  });
}

export async function getCompaniesByAdmin(adminId: number): Promise<Company[]> {
  return await prisma.company.findMany({
    where: { adminId },
  });
}

export async function updateCompany(id: number, data: Partial<ICompany>): Promise<Company> {
  return await prisma.company.update({
    where: { id },
    data,
  });
}

export async function deleteCompany(id: number): Promise<Company> {
  return await prisma.company.delete({
    where: { id },
  });
}
