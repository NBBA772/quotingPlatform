// server/api/twilio/status.post.ts
import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { CallSid, CallStatus, AgentId } = body;

  // Map Twilio status → DB fields
  const isOnCall = ["in-progress", "ringing", "queued"].includes(CallStatus);

  await prisma.insuranceAgent.update({
    where: { userId: Number(AgentId) },
    data: { isOnCall },
  });

  return { success: true };
});
