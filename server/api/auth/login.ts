/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email/username and password
 *     description: >
 *       Authenticates a user by validating the provided credentials.  
 *       On success, a session cookie is created and the sanitized user object is returned.  
 *       On failure, returns a 401 Unauthorized response.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: "johndoe@example.com"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 # other fields from sanitizeUserForFrontend
 *       400:
 *         description: Validation error (invalid request body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "usernameOrEmail is required"
 *                     - "password must be at least 6 characters"
 *       401:
 *         description: Invalid credentials or unauthenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Credentials"
 */

import bcrypt from 'bcryptjs'
import { getUserByEmail } from '~/server/database/repositories/userRespository';
import { sendError, H3Event } from "h3"
import { ZodError } from "zod"
import loginRequest from '~~/server/app/formRequests/LoginRequest';
import sendDefaultErrorResponse from '~~/server/app/errors/responses/DefaultErrorsResponse';
import { getMappedError } from '~~/server/app/errors/errorMapper';
import { makeSession } from '~~/server/app/services/sessionService';
import { sanitizeUserForFrontend } from '~~/server/app/services/userService';
import sendZodErrorResponse from '~~/server/app/errors/responses/ZodErrorsResponse';

const standardAuthError = getMappedError('Authentication', 'Invalid Credentials')

export default eventHandler(async (event: H3Event) => {

  try {
    const data = await loginRequest(event)
    const user = await getUserByEmail(data.usernameOrEmail)

    if (user === null) {
      return sendError(event, createError({ statusCode: 401, data: standardAuthError }))
    }

    if (user.password == undefined) {
      return sendError(event, createError({ statusCode: 401, data: standardAuthError }))
    }

    const isPasswordCorrect = await bcrypt.compare(data.password, user.password)

    if (!isPasswordCorrect) {
      return sendError(event, createError({ statusCode: 401, data: standardAuthError }))
    }

    await makeSession(user, event)
    return sanitizeUserForFrontend(user)
  } catch (error: any) {

    if (error.data instanceof ZodError) {
      return await sendZodErrorResponse(event, error.data)
    }

    return await sendDefaultErrorResponse(event, 'Unauthenticated', 401, error)
  }
})
