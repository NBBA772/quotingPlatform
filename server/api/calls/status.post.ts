// server/api/calls/status.post.ts
import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/database/client";
import Twilio from "twilio";
import { safePublish } from "~/server/utils/redisClient";

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const agentPhone = body?.To;
  const CallStatus = body?.CallStatus;

  if (!agentPhone || !CallStatus) return { ok: false };

  // Define active and ended call statuses
  const callActiveStatuses = ["ringing", "answered", "in-progress"];
  const callEndedStatuses = ["completed", "no-answer", "busy", "failed", "canceled"];

  // Determine if agent is on call
  const isOnCall = callActiveStatuses.includes(CallStatus);

  // Update agent
  const updated = await prisma.insuranceAgent.updateMany({
    where: { phone: agentPhone },
    data: { isOnCall },
  });

  console.log(`Updated rows: ${updated.count} | Agent ${agentPhone} isOnCall=${isOnCall} (CallStatus: ${CallStatus})`);

  // Only assign pending lead if call ended
  if (callEndedStatuses.includes(CallStatus)) {
    const agent = await prisma.insuranceAgent.findFirst({ where: { phone: agentPhone } });
    if (!agent) return { ok: true };

    // Find next pending lead
    const pendingLead = await prisma.lead.findFirst({
      where: { status: "pending", agentId: null },
      orderBy: { id: "asc" },
    });

    if (pendingLead) {
      // Assign lead to this agent
      const updatedLead = await prisma.lead.update({
        where: { id: pendingLead.id },
        data: { agentId: agent.id, status: "new" },
      });

      // Trigger call for queued lead
      await twilioClient.calls.create({
        url: `https://e62561302452.ngrok-free.app/api/calls/bridge-agent?lead=${encodeURIComponent(
          pendingLead.phone
        )}&agentId=${agent.id}`,
        to: agent.phone,
        from: TWILIO_NUMBER,
        statusCallback: "https://e62561302452.ngrok-free.app/api/calls/status",
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      });

      // Publish update to Redis for SSE
      await safePublish(`leads_channel:${agent.userId}`, JSON.stringify(updatedLead));
      console.log("Queued lead assigned and call triggered:", updatedLead.id);
    }
  }

  return { ok: true };
});
