import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "@/lib/auth/user";
import { getPool } from "@/lib/db";

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

  const email = normalizeEmail(body.email!);
  const passwordHash = await hashPassword(body.password!);

  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO users (email, password_hash, is_approved)
       VALUES ($1, $2, FALSE)`,
      [email, passwordHash],
    );
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e
        ? (e as { code: string }).code
        : "";
    if (code === "23505") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    throw e;
  }

  return NextResponse.json({
    ok: true,
    message:
      "Account created. An administrator must approve your account before you can sign in.",
  });
}
