import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: sends visitors without a session cookie to sign in.
// Pages still verify the session with requireUser().
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the sign-in page, API routes, Next.js internals and
  // files with an extension (icons, manifest.webmanifest, etc.).
  matcher: ["/((?!sign-in|api|_next/static|_next/image|.*\\..*).*)"],
};
