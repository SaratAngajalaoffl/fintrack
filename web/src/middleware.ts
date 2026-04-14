import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAuthMeUrl } from "@/lib/auth/auth-me-url";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { isAuthPagePath, isProtectedPath } from "@/lib/auth/routes";

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? "";
  if (!cookie.includes(`${SESSION_COOKIE}=`)) {
    return false;
  }
  const url = getAuthMeUrl(request.url);
  try {
    const res = await fetch(url, {
      headers: { cookie },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionValid = await hasValidSession(request);

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
