import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import type { FundBucketPriority } from "@/lib/fund-buckets/types";
import { setFundBucketPriority } from "@/services/fund-buckets/fund-buckets-db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ bucketId: string }>;
};

type SetPriorityBody = {
  priority?: FundBucketPriority;
};

function parsePriority(value: unknown): FundBucketPriority | null {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return null;
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SetPriorityBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const priority = parsePriority(body.priority);
  if (!priority) {
    return NextResponse.json(
      { error: "priority must be high, medium, or low" },
      { status: 400 },
    );
  }

  const { bucketId } = await context.params;
  const row = await setFundBucketPriority({
    userId: session.sub,
    bucketId,
    priority,
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ row });
}
