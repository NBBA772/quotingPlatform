/**
 * @swagger
 * /api/employee/register:
 *   post:
 *     summary: Register a new employee
 *     description: >
 *       Registers a new employee and creates a linked user. Requires a valid company business code.
 *     tags:
 *       - Employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessCode
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - username
 *               - password
 *             properties:
 *               businessCode:
 *                 type: string
 *                 example: "647733"
 *               firstName:
 *                 type: string
 *                 example: "Jane"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-123-0567"
 *               username:
 *                 type: string
 *                 example: "janedoe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongP@ssw0rd!"
 *     responses:
 *       200:
 *         description: Employee successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                 employee:
 *                   type: object
 *       400:
 *         description: Invalid business code or missing required fields
 *       500:
 *         description: Failed to create employee
 */

import prisma from '~/server/database/client'
import bcrypt from 'bcryptjs'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { businessCode, firstName, lastName, email, phone, username, password } = body

    if (!businessCode || !firstName || !lastName || !email || !username || !password) {
      throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    // 1. Validate company code
    const company = await prisma.company.findUnique({ where: { businessCode } })
    if (!company) throw createError({ statusCode: 400, message: 'Invalid business code' })

    // 2. Hash password for the User
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Create User first
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        username,
        password: hashedPassword,
        companyId: company.id
      }
    })

    // 4. Create Employee and link to User by userId
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        username,
        password: hashedPassword, // optional
        companyId: company.id,
        userId: user.id,          // 👈 fixed
        isActive: true,
        deletedAt: null
      }
    })

    return { success: true, user, employee }
  } catch (err: any) {
    console.error('Error registering employee:', err)
    if (err.code === 'P2002') {
      throw createError({ statusCode: 400, message: 'Email or username already exists' })
    }
    throw createError({ statusCode: 500, message: 'Failed to create employee' })
  }
})
