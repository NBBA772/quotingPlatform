// server/api/leads/webhook.post.ts
import { readBody, createError } from "h3";
import prisma from "~/server/database/client";
import { parsePhoneNumber } from "libphonenumber-js";
import { safePublish } from "~/server/utils/redisClient";

function normalizePhone(phone: string): string {
  try {
    return parsePhoneNumber(phone)?.number || phone;
  } catch {
    return phone;
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const leadsInput = Array.isArray(body) ? body : [body];

    if (!leadsInput.length) {
      throw createError({ statusCode: 400, message: "No leads provided" });
    }

    // 1. Fetch all active + available agents
    const allAgents = await prisma.insuranceAgent.findMany({
      where: { isActive: true, isAvailable: true },
      include: { user: true },
      orderBy: { id: "asc" },
    });


    // Only agents who are not on call
    const availableAgents = allAgents.filter(a => !a.isOnCall);

    if (!availableAgents.length) {
      throw createError({
        statusCode: 400,
        message: "No agents available right now",
      });
    }

    // 2. Get last assigned lead to determine round-robin start
    const lastLead = await prisma.lead.findFirst({
      orderBy: { id: "desc" },
      select: { agentId: true },
    });

    let nextAgentIndex = 0;
    if (lastLead) {
      const lastIndex = availableAgents.findIndex(
        a => a.id === lastLead.agentId
      );
      if (lastIndex >= 0) {
        nextAgentIndex = (lastIndex + 1) % availableAgents.length;
      }
    }

    const createdLeads = [];

    // 3. Assign leads
    for (const leadData of leadsInput) {
      const { firstName, lastName, email, phone, policyType, status } = leadData;
      if (!firstName || !lastName || !email || !phone || !policyType) {
        console.warn("Skipping invalid lead:", leadData);
        continue;
      }

      // Pick next agent in round-robin
      const assignedAgent = availableAgents[nextAgentIndex % availableAgents.length];

      const lead = await prisma.lead.create({
        data: {
          firstName,
          lastName,
          email,
          phone: normalizePhone(phone),
          policyType,
          status: status || "new",
          agentId: assignedAgent.id,
        },
      });

      // Publish to Redis for the assigned agent only
      await safePublish(
        `leads_channel:${assignedAgent.id}`,
        JSON.stringify(lead)
      );

      createdLeads.push({
        lead,
        assignedAgent: {
          id: assignedAgent.id,
          name: `${assignedAgent.user?.firstName} ${assignedAgent.user?.lastName}`,
        },
      });

      // Increment for next lead
      nextAgentIndex++;
    }

    return { success: true, count: createdLeads.length, leads: createdLeads };
  } catch (err: any) {
    console.error("Webhook error:", err);
    throw createError({ statusCode: 500, message: err.message });
  }
});
