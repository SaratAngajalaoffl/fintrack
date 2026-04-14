import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "@/lib/auth/user";
import { getPool } from "@/lib/db";
import {
  normalizeProfileName,
  parsePreferredCurrency,
  validatePreferredCurrency,
  validateProfileName,
} from "@/lib/user-profile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: {
    email?: string;
    password?: string;
    name?: string;
    preferredCurrency?: string;
  };
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
  const nameErr = validateProfileName(body.name ?? "");
  if (nameErr) {
    return NextResponse.json({ error: nameErr }, { status: 400 });
  }
  const currencyErr = validatePreferredCurrency(body.preferredCurrency ?? "");
  if (currencyErr) {
    return NextResponse.json({ error: currencyErr }, { status: 400 });
  }

  const email = normalizeEmail(body.email!);
  const passwordHash = await hashPassword(body.password!);
  const preferredCurrency = parsePreferredCurrency(body.preferredCurrency!);
  const name = normalizeProfileName(body.name!);

  const pool = getPool();
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const createdUser = await client.query<{ id: string }>(
        `INSERT INTO users (email, password_hash, is_approved)
         VALUES ($1, $2, FALSE)
         RETURNING id`,
        [email, passwordHash],
      );
      const userId = createdUser.rows[0]?.id;
      if (!userId) {
        throw new Error("Could not create user");
      }
      await client.query(
        `INSERT INTO user_profiles (user_id, name, preferred_currency)
         VALUES ($1, $2, $3)`,
        [userId, name, preferredCurrency],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
