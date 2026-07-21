import { readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import prisma from '~/server/database/client'
import { requireAuthUser } from '~/server/utils/enrollmentAuth'

// Lets a logged-in user reset their own password. Requires the current
// password, then updates User.password (what /api/auth/login checks) and syncs
// the linked role records (agent/company admin/employee) so nothing goes stale.
export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)

  const body = await readBody(event)
  const currentPassword = String(body.currentPassword ?? '')
  const newPassword = String(body.newPassword ?? '')

  if (!newPassword || newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'New password must be at least 8 characters' })
  }

  // Verify the current password against the stored hash.
  if (!user.password) {
    throw createError({ statusCode: 400, statusMessage: 'This account has no password set' })
  }
  const ok = await bcrypt.compare(currentPassword, user.password)
  if (!ok) {
    throw createError({ statusCode: 400, statusMessage: 'Current password is incorrect' })
  }
  if (currentPassword === newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'New password must be different from the current one' })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  // Keep the role-specific login copies in sync (best-effort).
  await prisma.insuranceAgent.updateMany({ where: { userId: user.id }, data: { password: hashed } })
  await prisma.employee.updateMany({ where: { userId: user.id }, data: { password: hashed } })
  if (user.companyAdminId) {
    await prisma.companyAdministrator
      .update({ where: { id: user.companyAdminId }, data: { password: hashed } })
      .catch((e) => console.error('Failed to sync company admin password:', e))
  }

  return { success: true }
})
