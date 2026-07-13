// server/api/agents/list.get.ts
import { defineEventHandler } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async () => {
  try {
    const agents = await prisma.insuranceAgent.findMany({
      where: { isActive: true }, // Only return active agents
      select: { 
        id: true, 
        firstName: true, 
        lastName: true,
        isActive: true 
      },
      orderBy: { firstName: "asc" } // Sort alphabetically
    });

    // Return just the IDs if you want
    const agentIds = agents.map(agent => agent.id);

    return { agents, agentIds };
  } catch (err: any) {
    console.error("Error fetching agents:", err);
    return { error: err.message || "Failed to fetch agents" };
  }
});
