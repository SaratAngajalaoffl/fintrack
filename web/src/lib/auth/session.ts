import { cookies, headers } from "next/headers";

import { getAuthMeUrl } from "@/lib/auth/auth-me-url";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export type SessionPayload = {
  sub: string;
  email: string;
};

/**
 * Loads the current user by asking the Go API to validate the session cookie (`GET /api/auth/me`).
 * JWT verification happens only on the backend.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader.includes(`${SESSION_COOKIE}=`)) {
    return null;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return null;

  const requestUrl = `${proto}://${host}/`;
  const url = getAuthMeUrl(requestUrl);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = (await res.json()) as {
    user?: { id?: string; email?: string } | null;
  };
  const id = data.user?.id;
  const email = data.user?.email;
  if (typeof id !== "string" || typeof email !== "string") return null;

  return { sub: id, email };
}
