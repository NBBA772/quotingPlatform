// server/api/calls/start.post.ts
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_NUMBER = process.env.TWILIO_NUMBER; // your purchased Twilio phone number

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { agentPhone, leadPhone } = body;

  if (!agentPhone || !leadPhone) {
    throw createError({ statusCode: 400, message: "Missing phone numbers" });
  }

  // Step 1: Call the agent
  const call = await client.calls.create({
    from: TWILIO_NUMBER,
    to: agentPhone,
    // When the agent answers, Twilio fetches TwiML from your webhook
    url: "https://your-app.com/api/calls/bridge?lead=" + leadPhone,
  });

  return { status: "calling-agent", callSid: call.sid };
});
