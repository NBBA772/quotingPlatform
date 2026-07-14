// server/api/leads/webhook.post.ts
import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/database/client";
import twilio from "twilio";
import { parsePhoneNumber } from "libphonenumber-js";
import { safePublish } from "~/server/utils/redisClient";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

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

    if (!leadsInput.length)
      throw createError({ statusCode: 400, message: "No leads provided" });

    // 1️⃣ Fetch all active + available agents
    let allAgents = await prisma.insuranceAgent.findMany({
      where: { isActive: true, isAvailable: true },
      include: { user: true },
      orderBy: { id: "asc" },
    });

    let availableAgents = allAgents.filter(a => !a.isOnCall);

    // 2️⃣ Get last assigned lead for round-robin
    const lastLead = await prisma.lead.findFirst({
      orderBy: { id: "desc" },
      select: { agentId: true },
    });

    let nextAgentIndex = 0;
    if (lastLead) {
      const lastIndex = availableAgents.findIndex(a => a.id === lastLead.agentId);
      if (lastIndex >= 0) nextAgentIndex = (lastIndex + 1) % availableAgents.length;
    }

    const createdLeads = [];

    for (const leadData of leadsInput) {
      const { firstName, lastName, email, phone, policyType, status } = leadData;
      if (!firstName || !lastName || !email || !phone || !policyType) continue;

      // Refresh available agents in case someone went on a call
      availableAgents = await prisma.insuranceAgent.findMany({
        where: { isActive: true, isAvailable: true, isOnCall: false },
        include: { user: true },
        orderBy: { id: "asc" },
      });

      // ✅ All agents busy → queue lead
      if (!availableAgents.length) {
        const lead = await prisma.lead.create({
          data: {
            firstName,
            lastName,
            email,
            phone: normalizePhone(phone),
            policyType,
            status: "pending", // unassigned
            agentId: null,
          },
        });

        createdLeads.push({ lead, assignedAgent: null });
        continue;
      }

      // 3️⃣ Assign lead in round-robin
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

      // 4️⃣ Trigger Twilio call
      await twilioClient.calls.create({
        url: `https://e62561302452.ngrok-free.app/api/calls/bridge-agent?lead=${encodeURIComponent(
          lead.phone
        )}&agentId=${assignedAgent.id}`,
        to: assignedAgent.phone,
        from: TWILIO_NUMBER,
        statusCallback: "https://e62561302452.ngrok-free.app/api/calls/status",
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      });

      // 5️⃣ Mark agent as on call
      await prisma.insuranceAgent.update({
        where: { id: assignedAgent.id },
        data: { isOnCall: true },
      });

      // 6️⃣ Publish to Redis for SSE
      await safePublish(`leads_channel:${assignedAgent.id}`, JSON.stringify(lead));

      createdLeads.push({
        lead,
        assignedAgent: {
          id: assignedAgent.id,
          name: `${assignedAgent.user?.firstName} ${assignedAgent.user?.lastName}`,
        },
      });

      nextAgentIndex = (nextAgentIndex + 1) % availableAgents.length;
    }

    return { success: true, count: createdLeads.length, leads: createdLeads };
  } catch (err: any) {
    console.error("Webhook error:", err);
    throw createError({ statusCode: 500, message: err.message || "Failed to process leads" });
  }
});
