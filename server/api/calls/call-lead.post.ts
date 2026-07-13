import { defineEventHandler, readBody, createError } from "h3";
import twilio from "twilio";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const { leadPhone, agentId } = await readBody(event);

    if (!leadPhone) throw createError({ statusCode: 400, message: "Missing leadPhone" });
    if (!agentId) throw createError({ statusCode: 400, message: "Missing agentId" });

    // Fetch the agent
    const agent = await prisma.insuranceAgent.findUnique({
      where: { id: Number(agentId) },
    });

    if (!agent || !agent.phone)
      throw createError({ statusCode: 400, message: "Agent not found or missing phone" });

    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

    const call = await client.calls.create({
      url: `https://e62561302452.ngrok-free.app/api/calls/bridge-agent?lead=${encodeURIComponent(
        leadPhone
      )}&agentId=${agent.id}`,
      to: agent.phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      statusCallback: "https://e62561302452.ngrok-free.app/api/calls/status",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    return { status: "calling agent", callSid: call.sid };
  } catch (err: any) {
    console.error("Twilio call error:", err);
    throw createError({ statusCode: 500, message: err.message || "Failed to initiate call" });
  }
});
