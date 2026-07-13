import { defineEventHandler, readBody } from "h3";
import twilio from "twilio";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Call will forward to the agent’s phone
  const dial = response.dial();
  dial.number(process.env.AGENT_PHONE_NUMBER); // Example: +15556667777

  return response.toString();
});
