/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Retrieve a list of companies
 *     description: Fetches all companies with basic details such as name, industry, and location.
 *     tags:
 *       - Companies
 *     responses:
 *       200:
 *         description: A list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   companyName:
 *                     type: string
 *                     example: "National Business Benefit Alliance"
 *                   industry:
 *                     type: string
 *                     example: "Healthcare"
 *                   city:
 *                     type: string
 *                     example: "Orlando"
 *                   state:
 *                     type: string
 *                     example: "FL"
 *       500:
 *         description: Server error while fetching companies
 */

import prisma from '~/server/database/client';

export default defineEventHandler(async () => {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
        industry: true,
        city: true,
        state: true,
      },
      orderBy: { companyName: 'asc' },
    });
    return companies;
  } catch (err: any) {
    console.error('Error fetching companies:', err);
    throw createError({ statusCode: 500, message: err.message });
  }
});
