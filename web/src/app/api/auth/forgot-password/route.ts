import { NextResponse } from "next/server";

import { issueOtpTicket } from "@/lib/auth/otp";
import { normalizeEmail, validateEmail } from "@/lib/auth/user";
import { findUserByEmail } from "@/lib/auth/user";

export const runtime = "nodejs";

/** Always returns 200 for unknown emails to avoid account enumeration. */
export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailErr = validateEmail(body.email ?? "");
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }

  const user = await findUserByEmail(body.email!);
  if (!user) {
    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for this email, further instructions apply.",
    });
  }

  const { otp, otpToken, expiresAt } = await issueOtpTicket(
    user.id,
    "password_reset",
    { emailNorm: normalizeEmail(user.email) },
  );
  console.log(
    `[auth] password_reset OTP for ${user.email} (user ${user.id}): ${otp}`,
  );

  return NextResponse.json({
    ok: true,
    otpToken,
    expiresAt,
    message:
      "If an account exists for this email, continue to set a new password.",
  });
}
