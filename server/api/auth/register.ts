/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user and company
 *     description: >
 *       Creates a new user, associated company, and company administrator account.  
 *       Also generates a unique 6-digit business code for the company and starts a session.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *               - companyName
 *               - ein
 *               - salesmanCode
 *               - industry
 *               - streetAddress
 *               - city
 *               - state
 *               - zipCode
 *               - companyPhone
 *               - companyEmail
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-123-4567"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "secret123"
 *               companyName:
 *                 type: string
 *                 example: "Doe Consulting LLC"
 *               ein:
 *                 type: string
 *                 example: "12-3456789"
 *               salesmanCode:
 *                 type: string
 *                 example: "SLS123"
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *               streetAddress:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "Springfield"
 *               state:
 *                 type: string
 *                 example: "IL"
 *               zipCode:
 *                 type: string
 *                 example: "62704"
 *               companyPhone:
 *                 type: string
 *                 example: "+1-555-987-6543"
 *               companyEmail:
 *                 type: string
 *                 example: "info@doeconsulting.com"
 *               website:
 *                 type: string
 *                 example: "https://doeconsulting.com"
 *               employeeSize:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Successfully registered user and company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: "abc123-session-id"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     companyId:
 *                       type: integer
 *                       example: 42
 *                     companyAdminId:
 *                       type: integer
 *                       example: 101
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *                   example:
 *                     email: "Email is already taken"
 *                     username: "Username must be at least 3 characters"
 *       500:
 *         description: Internal server error
 */

import { H3Event, sendError, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { validateUser } from '~/server/app/services/userService'
import { makeSession } from '~/server/app/services/sessionService'
import registerRequest from '~/server/app/formRequests/RegisterRequest'
import sendDefaultErrorResponse from '~~/server/app/errors/responses/DefaultErrorsResponse'
import sendZodErrorResponse from '~~/server/app/errors/responses/ZodErrorsResponse'
import { ZodError } from 'zod'
import prisma from '~/server/database/client'

export default eventHandler(async (event: H3Event) => {
  try {
    // 1. Get form data
    const data = await registerRequest(event)
    console.log('Incoming registration data:', data)

    // 2. Validate user
    const validation = await validateUser(data)
    if (validation.hasErrors && validation.errors) {
      return sendError(
        event,
        createError({
          statusCode: 422,
          data: Object.fromEntries(validation.errors),
        })
      )
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        loginType: 'email',
      },
    })
    console.log('User created:', user)

    async function generateUniqueBusinessCode() {
      let code: string
      let exists = true

      while (exists) {
        code = Math.floor(100000 + Math.random() * 900000).toString()
        const existing = await prisma.company.findUnique({
          where: { businessCode: code },
        })
        exists = !!existing
      }

      return code!
    }
    

    // 5. Generate a 6-digit business code
    const businessCode = await generateUniqueBusinessCode()

    // 6. Create Company with businessCode
    const company = await prisma.company.create({
      data: {
        companyName: data.companyName,
        ein: data.ein,
        salesmanCode: data.salesmanCode,
        industry: data.industry,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phoneNumber: data.companyPhone,
        companyEmail: data.companyEmail,
        website: data.website,
        employeeSize: String(data.employeeSize),
        businessCode,   // <-- Add the generated code here
      },
    })
    console.log('Company created:', company, 'Business Code:', businessCode)

    // 7. Create CompanyAdministrator linked to company and user
    const companyAdmin = await prisma.companyAdministrator.create({
      data: {
        firstName: user.firstName!,
        lastName: user.lastName!,
        username: user.username!,
        email: user.email!,
        password: user.password, // already hashed
        phoneNumber: user.phone!,
        company: { connect: { id: company.id } },
        users: { connect: { id: user.id } },
      },
    })
    console.log('CompanyAdmin created:', companyAdmin)

    // 8. Update User to reference companyAdmin and company
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        companyAdminId: companyAdmin.id,
        companyId: company.id,
      },
    })
    console.log('Updated user with companyAdmin and company:', updatedUser)

    // 9. Create session
    const session = await makeSession(updatedUser, event)
    console.log('Session created:', session)
    return {
      session,
      company, // <-- add this line
      user: updatedUser
    }
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.data instanceof ZodError) {
      return await sendZodErrorResponse(event, error.data)
    }

    return await sendDefaultErrorResponse(event, 'oops', 500, error)
  }
})
