import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { findUserById, normalizeEmail } from "@/lib/auth/user";

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

  return NextResponse.json({
    user: {
      id: user.id,
      email: normalizeEmail(user.email),
      isApproved: user.is_approved,
    },
  });
}
