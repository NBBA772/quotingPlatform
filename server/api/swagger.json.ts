// server/swagger.json.ts
import { defineEventHandler } from "h3";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NBBA API",
      version: "1.0.0",
      description:
        "API documentation for the NBBA app — a comprehensive group insurance management platform that allows users to track, manage, and access their insurance plans, claims, and related resources efficiently.",
    },
    servers: [{ url: "https://businessbenefitalliance.com" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 4 },
            firstName: { type: "string", example: "Donavan" },
            lastName: { type: "string", example: "Jones" },
            email: { type: "string", format: "email", example: "donavan@example.com" },
            phone: { type: "string", example: "1234567890" },
            avatar: {
              type: "string",
              format: "uri",
              example: "https://bucket.s3.region.amazonaws.com/avatars/123456.jpg",
            },
            insuranceCardImage: {
              type: "string",
              format: "uri",
              example: "https://bucket.s3.region.amazonaws.com/insurance-cards/123456.jpg",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./server/api/**/*.ts"], // Path to your API endpoints (with JSDoc comments)
};

const swaggerSpec = swaggerJsdoc(options);

export default defineEventHandler(() => {
  return swaggerSpec;
});
