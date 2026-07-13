import prisma from "~/server/database/client"

export default defineEventHandler(async () => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        agent: true, // assumes `agentId` field exists in your Company model
      },
      orderBy: { createdAt: "desc" },
    })

    return { companies }
  } catch (err) {
    console.error("Error fetching companies:", err)
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch companies" })
  }
})
