import { NextResponse } from "next/server";

import { verifyOtpTicket } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { validateOtp, validatePassword } from "@/lib/auth/user";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { newPassword?: string; otp?: string; otpToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const otpErr = validateOtp(body.otp ?? "");
  if (otpErr) {
    return NextResponse.json({ error: otpErr }, { status: 400 });
  }
  const pwErr = validatePassword(body.newPassword ?? "");
  if (pwErr) {
    return NextResponse.json({ error: pwErr }, { status: 400 });
  }
  if (!body.otpToken || typeof body.otpToken !== "string") {
    return NextResponse.json(
      { error: "otpToken is required" },
      { status: 400 },
    );
  }

  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticket = await verifyOtpTicket(
    body.otpToken,
    body.otp!,
    "password_change",
  );
  if (!ticket || ticket.sub !== user.id) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 },
    );
  }

  const hash = await hashPassword(body.newPassword!);
  const pool = getPool();
  await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
    [hash, user.id],
  );

  return NextResponse.json({ ok: true, message: "Password changed." });
}
