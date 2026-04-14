import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import type { FundBucketPriority } from "@/lib/fund-buckets/types";
import {
  createFundBucket,
  listFundBuckets,
} from "@/services/fund-buckets/fund-buckets-db";

export const runtime = "nodejs";

type CreateFundBucketBody = {
  name?: string;
  targetAmount?: number;
  bankAccountId?: string;
  priority?: FundBucketPriority;
};

function parsePriority(value: unknown): FundBucketPriority | null {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listFundBuckets(session.sub);
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateFundBucketBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "Fund bucket name is required" },
      { status: 400 },
    );
  }

  if (
    typeof body.targetAmount !== "number" ||
    !Number.isFinite(body.targetAmount) ||
    body.targetAmount <= 0
  ) {
    return NextResponse.json(
      { error: "targetAmount must be a number greater than 0" },
      { status: 400 },
    );
  }

  const bankAccountId = body.bankAccountId?.trim() ?? "";
  if (!bankAccountId) {
    return NextResponse.json(
      { error: "bankAccountId is required" },
      { status: 400 },
    );
  }

  const priority = parsePriority(body.priority ?? "medium");
  if (!priority) {
    return NextResponse.json(
      { error: "priority must be high, medium, or low" },
      { status: 400 },
    );
  }

  try {
    const row = await createFundBucket({
      userId: session.sub,
      name,
      targetAmount: body.targetAmount,
      bankAccountId,
      priority,
    });
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Bank account not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
