import { NextResponse } from "next/server";

import { JWT_TTL_SEC, SESSION_COOKIE } from "@/lib/auth/constants";
import { signSessionToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import {
  findUserByEmail,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "@/lib/auth/user";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailErr = validateEmail(body.email ?? "");
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }
  const pwErr = validatePassword(body.password ?? "");
  if (pwErr) {
    return NextResponse.json({ error: pwErr }, { status: 400 });
  }

  const user = await findUserByEmail(body.email!);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(body.password!, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (!user.is_approved) {
    return NextResponse.json(
      {
        error:
          "Your account is not approved yet. Contact an administrator or wait for approval.",
      },
      { status: 403 },
    );
  }

  const token = await signSessionToken({
    sub: user.id,
    email: normalizeEmail(user.email),
  });

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: normalizeEmail(user.email) },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: JWT_TTL_SEC,
  });
  return res;
}
