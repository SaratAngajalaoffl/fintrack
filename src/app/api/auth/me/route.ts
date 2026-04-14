import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { findUserById, normalizeEmail } from "@/lib/auth/user";
import { getPool } from "@/lib/db";
import {
  normalizeProfileName,
  parsePreferredCurrency,
  validatePreferredCurrency,
  validateProfileName,
} from "@/lib/user-profile";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const pool = getPool();
  const profileResult = await pool.query<{
    name: string;
    preferred_currency: string;
  }>(
    `SELECT name, preferred_currency
     FROM user_profiles
     WHERE user_id = $1
     LIMIT 1`,
    [user.id],
  );
  const profile = profileResult.rows[0];

  return NextResponse.json({
    user: {
      id: user.id,
      email: normalizeEmail(user.email),
      isApproved: user.is_approved,
      name: profile?.name ?? "User",
      preferredCurrency: parsePreferredCurrency(
        profile?.preferred_currency ?? "USD",
      ),
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { preferredCurrency?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hasName = typeof body.name === "string";
  const hasPreferredCurrency = typeof body.preferredCurrency === "string";
  if (!hasName && !hasPreferredCurrency) {
    return NextResponse.json(
      { error: "Provide at least one profile field to update" },
      { status: 400 },
    );
  }

  if (hasName) {
    const nameErr = validateProfileName(body.name ?? "");
    if (nameErr) {
      return NextResponse.json({ error: nameErr }, { status: 400 });
    }
  }

  if (hasPreferredCurrency) {
    const currencyErr = validatePreferredCurrency(body.preferredCurrency ?? "");
    if (currencyErr) {
      return NextResponse.json({ error: currencyErr }, { status: 400 });
    }
  }

  const name = hasName ? normalizeProfileName(body.name ?? "") : null;
  const preferredCurrency = hasPreferredCurrency
    ? parsePreferredCurrency(body.preferredCurrency ?? "")
    : null;
  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const normalizedEmail = normalizeEmail(user.email);
  const pool = getPool();
  await pool.query(
    `INSERT INTO user_profiles (user_id, name, preferred_currency)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET
       name = COALESCE($4, user_profiles.name),
       preferred_currency = COALESCE($5, user_profiles.preferred_currency),
       updated_at = NOW()`,
    [
      session.sub,
      name ?? normalizedEmail,
      preferredCurrency ?? "USD",
      name,
      preferredCurrency,
    ],
  );

  const profileResult = await pool.query<{
    name: string;
    preferred_currency: string;
  }>(
    `SELECT name, preferred_currency
     FROM user_profiles
     WHERE user_id = $1
     LIMIT 1`,
    [session.sub],
  );
  const profile = profileResult.rows[0];
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: normalizedEmail,
      isApproved: user.is_approved,
      name: profile?.name ?? normalizedEmail,
      preferredCurrency: parsePreferredCurrency(
        profile?.preferred_currency ?? "USD",
      ),
    },
  });
}
