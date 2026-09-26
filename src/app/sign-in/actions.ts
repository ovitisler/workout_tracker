"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";

export type SignInState = { error?: string; email?: string };

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
      return { error: error.message, email };
    }
    throw error;
  }

  redirect("/");
}

export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/sign-in");
}
