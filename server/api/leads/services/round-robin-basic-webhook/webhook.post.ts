// server/api/leads/webhook.post.ts
import { readBody, createError } from "h3";
import prisma from "~/server/database/client";
import { safePublish } from "~/server/utils/redisClient";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Accept either a single lead or an array
    const leadsInput = Array.isArray(body) ? body : [body];

    if (!leadsInput.length) {
      throw createError({ statusCode: 400, message: "No leads provided" });
    }

    // 1. Fetch active agents
    const agents = await prisma.insuranceAgent.findMany({
      where: { isActive: true },
      include: { user: true },
      orderBy: { id: "asc" },
    });

    if (!agents.length) {
      throw createError({ statusCode: 400, message: "No active insurance agents found" });
    }

    // 2. Get last assigned lead
    const lastLead = await prisma.lead.findFirst({
      orderBy: { id: "desc" },
      select: { agentId: true },
    });

    let nextAgentIndex = 0;
    if (lastLead) {
      const lastIndex = agents.findIndex((a) => a.userId === lastLead.agentId);
      nextAgentIndex = (lastIndex + 1) % agents.length;
    }

    const createdLeads = [];

    for (const leadData of leadsInput) {
      const { firstName, lastName, email, phone, policyType, status } = leadData;

      if (!firstName || !lastName || !email || !phone || !policyType) {
        continue; // skip invalid lead
      }

      const assignedAgent = agents[nextAgentIndex];

      const lead = await prisma.lead.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          policyType,
          status: status || "new",
          agentId: assignedAgent.userId!,
        },
      });

      // Publish to Redis
      await safePublish(`leads_channel:${assignedAgent.userId}`, JSON.stringify(lead));

      createdLeads.push({
        lead,
        assignedAgent: {
          id: assignedAgent.userId,
          name: `${assignedAgent.user?.firstName} ${assignedAgent.user?.lastName}`,
        },
      });

      // Round-robin
      nextAgentIndex = (nextAgentIndex + 1) % agents.length;
    }

    return { success: true, count: createdLeads.length, leads: createdLeads };
  } catch (err: any) {
    console.error("Webhook error:", err);
    throw createError({ statusCode: 500, message: err.message });
  }
});
