import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { unlockFundBucket } from "@/services/fund-buckets/fund-buckets-db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ bucketId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bucketId } = await context.params;
  const row = await unlockFundBucket({ userId: session.sub, bucketId });

  if (!row) {
    return NextResponse.json(
      { error: "Fund bucket not found, already unlocked, or target not met" },
      { status: 409 },
    );
  }

  return NextResponse.json({ row });
}
