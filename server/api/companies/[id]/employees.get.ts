import prisma from '~/server/database/client';
import { getRouterParams, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) throw createError({ statusCode: 400, message: 'Company ID missing' });

  try {
    const employees = await prisma.employee.findMany({
      where: { companyId: Number(id), isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        username: true,
        user: { select: { id: true } },
      },
      orderBy: { order: 'asc' },
    });

    const company = await prisma.company.findUnique({
      where: { id: Number(id) },
      select: {
        administrators: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            phoneNumber: true,          // correct field name
            users: { select: { id: true } }, // relation exists
          }
        }
      }
    });

    // Map so front-end can access emp.userId directly
    const employeeData = employees.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      username: emp.username,
      userId: emp.user?.id || null,
    }));

    const companyAdmins = company?.administrators.map(admin => ({
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      username: admin.username,
      email: admin.email,
      phone: admin.phoneNumber,        // map to `phone` for frontend
      userId: admin.users.length > 0 ? admin.users[0].id : null, // assuming 1:1 relation
    })) || [];

    return {
      employees: employeeData,
      companyAdmins,
    };

  } catch (err: any) {
    console.error('Error fetching employees:', err);
    throw createError({ statusCode: 500, message: err.message });
  }
});
