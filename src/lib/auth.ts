import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getDb } from "@/db";
import * as schema from "@/db/schema";

// Comma-separated emails allowed to create an account. If unset, nobody can
// sign up. Existing users can always sign in.
function allowedEmails() {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

// Hosts the app may be served from. Vercel sets these automatically for every
// deployment, so production, previews and localhost work without configuring
// a URL.
function allowedHosts() {
  return [
    "localhost:*",
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((host): host is string => Boolean(host));
}

function createAuth() {
  return betterAuth({
    appName: "Workout Tracker",
    baseURL: { allowedHosts: allowedHosts() },
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    emailAndPassword: { enabled: true },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!allowedEmails().includes(user.email.toLowerCase())) {
              throw new APIError("FORBIDDEN", {
                message: "Sign-up is invite-only. Ask the owner to add your email.",
              });
            }
          },
        },
      },
    },
    // Lets server actions set the session cookie. Must be the last plugin.
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

// Created on first use for the same reason as getDb(): `next build` must work
// without database credentials or an auth secret.
export function getAuth() {
  instance ??= createAuth();
  return instance;
}

export const getSession = cache(async () => {
  // Read headers first: it marks the page dynamic before any auth setup runs.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
});

// For pages and actions that need a signed-in user. Redirects otherwise.
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session.user;
}
