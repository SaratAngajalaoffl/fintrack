import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { allocateFundsToBucket } from "@/services/fund-buckets/fund-buckets-db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ bucketId: string }>;
};

type AllocateFundsBody = {
  amount?: number;
};

export async function POST(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AllocateFundsBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body.amount !== "number" ||
    !Number.isFinite(body.amount) ||
    body.amount <= 0
  ) {
    return NextResponse.json(
      { error: "amount must be a number greater than 0" },
      { status: 400 },
    );
  }

  const { bucketId } = await context.params;

  try {
    const row = await allocateFundsToBucket({
      userId: session.sub,
      bucketId,
      amount: body.amount,
    });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ row });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Cannot allocate funds to an unlocked fund bucket"
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (
        error.message ===
        "Insufficient available balance in bank account for this allocation"
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message === "Bank account not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    throw error;
  }
}
