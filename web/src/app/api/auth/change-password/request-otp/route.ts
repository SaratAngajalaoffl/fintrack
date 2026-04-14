import { NextResponse } from "next/server";

import { issueOtpTicket } from "@/lib/auth/otp";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { otp, otpToken, expiresAt } = await issueOtpTicket(
    user.id,
    "password_change",
  );
  console.log(
    `[auth] password_change OTP for ${user.email} (user ${user.id}): ${otp}`,
  );

  return NextResponse.json({
    ok: true,
    otpToken,
    expiresAt,
    message:
      "Use the OTP from the server log (dev) with otpToken, expiresAt, and your new password to confirm.",
  });
}
