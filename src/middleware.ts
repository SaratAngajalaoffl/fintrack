import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { isAuthPagePath, isProtectedPath } from "@/lib/auth/routes";

function getSecret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = getSecret();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let sessionValid = false;
  if (token && secret) {
    try {
      await jwtVerify(token, secret);
      sessionValid = true;
    } catch {
      sessionValid = false;
    }
  }

  if (isProtectedPath(pathname) && !sessionValid) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (sessionValid && isAuthPagePath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
