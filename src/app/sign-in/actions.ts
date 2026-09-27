"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { accessRequests } from "@/db/schema";
import { countPendingRequests, findRequest } from "@/lib/access";
import { getAuth } from "@/lib/auth";
import { isValidEmail } from "@/lib/email-list";

export type SignInState = {
  error?: string;
  email?: string;
  // Sign-up was refused because the email isn't allowed: offer to request access.
  canRequestAccess?: boolean;
};

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const creatingAccount = formData.get("intent") === "sign-up";

  try {
    if (creatingAccount) {
      await getAuth().api.signUpEmail({
        // Better Auth requires a name; we don't ask for one yet.
        body: { email, password, name: email.split("@")[0] },
        headers: await headers(),
      });
    } else {
      await getAuth().api.signInEmail({
        body: { email, password },
        headers: await headers(),
      });
    }
  } catch (error) {
    if (isAPIError(error)) {
      return {
        error: error.message,
        email,
        canRequestAccess: creatingAccount && error.status === "FORBIDDEN",
      };
    }
    throw error;
  }

  redirect("/");
}

export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/sign-in");
}

export type RequestAccessState = { error?: string; message?: string };

// Stops a flood of junk requests; real ones are rare.
const MAX_PENDING_REQUESTS = 50;

export async function requestAccess(
  _prev: RequestAccessState,
  formData: FormData,
): Promise<RequestAccessState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const note = String(formData.get("note") ?? "").trim().slice(0, 200) || null;
  if (!isValidEmail(email)) return { error: "Enter a valid email above first." };

  const existing = await findRequest(email);
  if (existing?.status === "approved") {
    return { message: "You're approved! Go back and create your account." };
  }
  if (existing) {
    return { message: "You've already asked. The owner will review it." };
  }
  if ((await countPendingRequests()) >= MAX_PENDING_REQUESTS) {
    return { error: "Too many requests right now. Try again later." };
  }

  await getDb().insert(accessRequests).values({ email, note }).onConflictDoNothing();
  return {
    message: "Request sent. Once it's approved, come back and tap Create account.",
  };
}
