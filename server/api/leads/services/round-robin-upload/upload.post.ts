import { defineEventHandler, readMultipartFormData, createError, sendError, getHeader } from "h3";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";
import { safePublish } from "~/server/utils/redisClient";

let roundRobinIndex = 0;

export default defineEventHandler(async (event) => {
  try {
    // Authenticate AppAdmin
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" });

    const user = await getUserByAuthToken(authToken);
    if (!user || !user.appAdminId) throw createError({ statusCode: 401, message: "Unauthorized" });

    // Read uploaded file
    const form = await readMultipartFormData(event);
    if (!form) throw createError({ statusCode: 400, message: "No file uploaded" });

    const file = form.find(f => f.name === "file");
    if (!file) throw createError({ statusCode: 400, message: "File field missing" });

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filePath = path.join(uploadsDir, file.filename);
    fs.writeFileSync(filePath, file.data);

    // Parse CSV
    const leads: any[] = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", row => leads.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Fetch all active insurance agents under this AppAdmin
    const agents = await prisma.insuranceAgent.findMany({
      where: { appAdminId: user.appAdminId, isActive: true }
    });

    if (agents.length === 0) throw createError({ statusCode: 400, message: "No agents available" });

    // Round-robin assignment & Redis publish
    for (const lead of leads) {
      const agent = agents[roundRobinIndex % agents.length];

      const createdLead = await prisma.lead.create({
        data: {
          firstName: lead.first_name,
          lastName: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          policyType: lead.policy_type,
          agentId: agent.userId,
          status: "assigned"
        }
      });

      // Publish to Redis so SSE subscribers get it in real-time
      await safePublish(`leads_channel:${agent.userId}`, JSON.stringify(createdLead));

      roundRobinIndex++;
    }

    return { success: true, count: leads.length };

  } catch (err: any) {
    console.error("Upload error:", err);
    return sendError(event, createError({ statusCode: 500, statusMessage: err.message }));
  }
});
