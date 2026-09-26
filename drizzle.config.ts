import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

// Locally, connection strings come from `vercel env pull .env.local`.
// On Vercel they're already in the environment.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    // Migrations need a direct (non-pooled) connection.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
});
