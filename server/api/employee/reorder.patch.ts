/**
 * @swagger
 * /api/employee/reorder:
 *   patch:
 *     summary: Reorder employees
 *     description: >
 *       Updates the `order` field for multiple employees in a batch. Accepts an array of objects
 *       containing `id` and `order` for each employee.
 *     tags:
 *       - Employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - id
 *                 - order
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 order:
 *                   type: integer
 *                   example: 5
 *     responses:
 *       200:
 *         description: Employees reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request body (not an array or missing fields)
 *       500:
 *         description: Failed to reorder employees due to a server error
 */

import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ id: number; order: number }[]>(event);

    if (!Array.isArray(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body",
      });
    }

    console.log("Reorder payload:", body);

    // Perform batch updates
    await Promise.all(
      body.map((emp) =>
        prisma.employee.update({
          where: { id: emp.id },
          data: { order: emp.order },
        })
      )
    );

    return { success: true };
  } catch (err) {
    console.error("Error reordering employees:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to reorder employees",
    });
  }
});
