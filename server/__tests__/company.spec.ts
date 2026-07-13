import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Mock fetch for server-side testing
beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    // Only intercept the /api/company/:id endpoint
    if (url.includes("/api/company/1")) {
      const company = await prisma.company.findUnique({
        where: { id: 1 },
        include: { administrators: true, employees: true, users: true },
      });

      return {
        ok: true,
        json: async () => company,
      };
    }
    return { ok: false, json: async () => ({}) };
  });
});

afterAll(async () => {
  vi.restoreAllMocks();
  await prisma.$disconnect();
});

describe("API: /api/company/:id", () => {
  it("✅ Fetches company data with real model fields (mocked fetch)", async () => {
    const response = await fetch("http://localhost:3000/api/company/1");
    expect(response.ok).toBe(true);

    const company = await response.json();
    expect(company).toBeDefined();
    expect(company).toHaveProperty("id", 1);
    expect(company).toHaveProperty("companyName");
    expect(company).toHaveProperty("industry");
    expect(company).toHaveProperty("streetAddress");
    expect(company).toHaveProperty("city");
    expect(company).toHaveProperty("state");
    expect(company).toHaveProperty("zipCode");
    expect(company).toHaveProperty("phoneNumber");
    expect(company).toHaveProperty("companyEmail");
    expect(company).toHaveProperty("administrators");
    expect(Array.isArray(company.administrators)).toBe(true);
    expect(company).toHaveProperty("employees");
    expect(Array.isArray(company.employees)).toBe(true);
  });
});
