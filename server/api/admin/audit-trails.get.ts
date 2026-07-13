import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    const auditTrails = await prisma.auditTrail.findMany({
        where: { deletedAt: null },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        insuranceApplication: {
          select: { id: true, firstName: true, lastName: true, email: true, pdfUrl: true },
        },
      },
    });

    return { success: true, data: auditTrails };
  } catch (error) {
    console.error("Error fetching audit trails:", error);
    return { success: false, error: "Failed to fetch audit trails" };
  }
});
