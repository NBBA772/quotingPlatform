/**
 * @swagger
 * /api/register-appadmin:
 *   post:
 *     summary: Register a new AppAdmin
 *     description: Creates a new AppAdmin and links it to a User account.
 *     tags:
 *       - AppAdmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - username
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Super"
 *               lastName:
 *                 type: string
 *                 example: "Admin"
 *               email:
 *                 type: string
 *                 example: "admin@businessbenefitalliance.com"
 *               username:
 *                 type: string
 *                 example: "appadmin"
 *               password:
 *                 type: string
 *                 example: "SuperSecurePassword123!"
 *     responses:
 *       200:
 *         description: AppAdmin successfully registered
 */
import prisma from '~/server/database/client'
import { hash } from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { firstName, lastName, email, username, password } = body

    if (!firstName || !lastName || !email || !username || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create or find AppAdmin
    const appAdmin = await prisma.appAdmin.upsert({
      where: { username },
      update: {},
      create: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
      },
    })

    // Create or link User
    const user = await prisma.user.upsert({
      where: { username },
      update: { appAdminId: appAdmin.id },
      create: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        appAdminId: appAdmin.id,
      },
    })

    return { success: true, appAdmin, user }
  } catch (err: any) {
    console.error('AppAdmin registration failed:', err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to register AppAdmin' })
  }
})
