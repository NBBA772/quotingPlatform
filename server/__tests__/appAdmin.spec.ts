import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Mock fetch for server-side testing
beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    if (url.includes("/api/is-app-admin/1")) {
      const appDdmin = await prisma.appAdmin.findUnique({
        where: { id: 1 },
        include: {
          users: true, // include related users if needed
        },
      });

      return {
        ok: true,
        json: async () => appDdmin, 
      };
    }
    return { ok: false, json: async () => ({}) };
  });
});

afterAll(async () => {
  vi.restoreAllMocks();
  await prisma.$disconnect();
});

describe("API: /api/is-app-admin/:id", () => {
  it("✅ Fetches AppAdmin data with real model fields (mocked fetch)", async () => {
    const response = await fetch("http://localhost:3000/api/is-app-admin/1");
    expect(response.ok).toBe(true);

    const appDdmin = await response.json();
    expect(appDdmin).toBeDefined();

    // Scalars
    expect(appDdmin).toHaveProperty("id", 1);
    expect(appDdmin).toHaveProperty("firstName");
    expect(appDdmin).toHaveProperty("lastName");
    expect(appDdmin).toHaveProperty("username");
    expect(appDdmin).toHaveProperty("email");
    expect(appDdmin).toHaveProperty("password");
    expect(appDdmin).toHaveProperty("createdAt");
    expect(appDdmin).toHaveProperty("updatedAt");

    // Relations
    expect(appDdmin.users).toBeInstanceOf(Array);
  });
});
