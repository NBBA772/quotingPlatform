/**
 * @swagger
 * /api/company/{id}:
 *   get:
 *     summary: Get a company by ID
 *     description: Retrieves the details of a single company using its ID.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company to retrieve
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     companyName:
 *                       type: string
 *                       example: "Acme Corp"
 *                     ein:
 *                       type: string
 *                       example: "12-3456789"
 *                     industry:
 *                       type: string
 *                       example: "Technology"
 *                     streetAddress:
 *                       type: string
 *                       example: "123 Main St"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     state:
 *                       type: string
 *                       example: "NY"
 *                     zipCode:
 *                       type: string
 *                       example: "10001"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1-555-123-4567"
 *                     companyEmail:
 *                       type: string
 *                       example: "info@acme.com"
 *                     website:
 *                       type: string
 *                       example: "https://acme.com"
 *                     employeeSize:
 *                       type: string
 *                       example: "50-200"
 *                     businessCode:
 *                       type: string
 *                       example: "ACME123"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Company ID is missing
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */

import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params

  if (!id) {
    throw createError({ statusCode: 400, message: 'Company ID is required' })
  }

  const company = await prisma.company.findUnique({
    where: { id: Number(id) },
  })

  if (!company) {
    throw createError({ statusCode: 404, message: 'Company not found' })
  }

  return { company }
})
