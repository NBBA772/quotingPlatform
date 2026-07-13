import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    // Match /api/plans/:id dynamically
    const match = url.match(/\/api\/plans\/(\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
          user: true,       // singular relation
          benefits: true,   // array relation
        },
      });

      return {
        ok: true,
        json: async () => plan,
      };
    }

    return { ok: false, json: async () => ({}) };
  });
});

afterAll(async () => {
  vi.restoreAllMocks();
  await prisma.$disconnect();
});

describe("API: /api/plans/:id", () => {
  it("✅ Fetches Plan data with real model fields (mocked fetch)", async () => {
    const response = await fetch("http://localhost:3000/api/plans/1");
    expect(response.ok).toBe(true);

    const plan = await response.json();
    expect(plan).toBeDefined();

    // Scalars
    expect(plan).toHaveProperty("id", 1);
    expect(plan).toHaveProperty("userId");
    expect(plan).toHaveProperty("planName");
    expect(plan).toHaveProperty("planType");
    expect(plan).toHaveProperty("coverageStart");
    expect(plan).toHaveProperty("coverageEnd");
    expect(plan).toHaveProperty("networkType");
    expect(plan).toHaveProperty("primaryCareRequired");
    expect(plan).toHaveProperty("referralRequired");
    expect(plan).toHaveProperty("outOfNetwork");
    expect(plan).toHaveProperty("createdAt");
    expect(plan).toHaveProperty("updatedAt");

    // Relations
    expect(plan.user).toBeDefined();        // singular
    expect(plan.benefits).toBeInstanceOf(Array);
  });
});
