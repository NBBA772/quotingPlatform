import { defineEventHandler } from "h3";
import { twiml } from "twilio";

export default defineEventHandler((event) => {
  const leadPhone = event.node.req.url?.split("lead=")[1];
  if (!leadPhone) throw new Error("Missing lead phone");

  const response = new twiml.VoiceResponse();
  const dial = response.dial();
  dial.number(leadPhone);

  event.node.res.setHeader("Content-Type", "text/xml");
  return response.toString();
});
