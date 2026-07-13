import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Mock fetch for server-side testing
beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    // Only intercept the /api/user endpoint
    if (url.includes("/api/user/1")) {
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          photos: true,
          plans: true,
          providerNetworks: true,
          providers: true,
          claimSupports: true,
          companyAdmin: true,
          appAdmin: true,
          company: true,
          session: true,
          Subscription: true,
          employee: true,
        },
      });

      return {
        ok: true,
        json: async () => user,
      };
    }
    return { ok: false, json: async () => ({}) };
  });
});

afterAll(async () => {
  vi.restoreAllMocks();
  await prisma.$disconnect();
});

describe("API: /api/user/:id", () => {
  it("✅ Fetches user data with real model fields (mocked fetch)", async () => {
    const response = await fetch("http://localhost:3000/api/user/1");
    expect(response.ok).toBe(true);

    const user = await response.json();
    expect(user).toBeDefined();

    // Scalars
    expect(user).toHaveProperty("id", 1);
    expect(user).toHaveProperty("loginType");
    expect(user).toHaveProperty("password");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("firstName");
    expect(user).toHaveProperty("lastName");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("phone");
    expect(user).toHaveProperty("avatar");
    expect(user).toHaveProperty("insuranceCardImage");
    expect(user).toHaveProperty("dentalCardImage");
    expect(user).toHaveProperty("visionCardImage");
    expect(user).toHaveProperty("companyAdminId");
    expect(user).toHaveProperty("appAdminId");
    expect(user).toHaveProperty("companyId");
    expect(user).toHaveProperty("stripeCustomerId");
    expect(user).toHaveProperty("isActive");
    expect(user).toHaveProperty("deletedAt");
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("updatedAt");

    // Relations
    expect(user.photos).toBeInstanceOf(Array);
    expect(user.plans).toBeInstanceOf(Array);
    expect(user.providerNetworks).toBeInstanceOf(Array);
    expect(user.providers).toBeInstanceOf(Array);
    expect(user.claimSupports).toBeInstanceOf(Array);

    expect(user.companyAdmin).toBeDefined();
    expect(user.appAdmin).toBeDefined();
    expect(user.company).toBeDefined();
    expect(user.session).toBeInstanceOf(Array);
    expect(user.Subscription).toBeInstanceOf(Array);
    expect(user.employee).toBeDefined();
  });
});
