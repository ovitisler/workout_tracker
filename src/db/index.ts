import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local`.");
  }
  return drizzle({ client: neon(url), schema, casing: "snake_case" });
}

let instance: ReturnType<typeof createDb> | undefined;

// Created on first use rather than at import, so `next build` works
// without database credentials (e.g. in CI).
export function getDb() {
  instance ??= createDb();
  return instance;
}
