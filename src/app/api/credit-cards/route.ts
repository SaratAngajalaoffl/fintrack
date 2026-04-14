import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  createCreditCard,
  listCreditCards,
} from "@/services/credit-cards/credit-cards-db";

export const runtime = "nodejs";

type CreateCreditCardBody = {
  name?: string;
  description?: string;
  maxBalance?: number;
  usedBalance?: number;
  lockedBalance?: number;
  preferredCategories?: string[];
  billGenerationDay?: number;
  billDueDay?: number;
  previousBillCycleLabel?: string | null;
  previousBillPdfUrl?: string | null;
  previousBillPaid?: boolean;
};

function isValidDay(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 31
  );
}

function normalizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listCreditCards(session.sub);
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateCreditCardBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "Credit card name is required" },
      { status: 400 },
    );
  }

  if (
    typeof body.maxBalance !== "number" ||
    !Number.isFinite(body.maxBalance)
  ) {
    return NextResponse.json(
      { error: "maxBalance must be a valid number" },
      { status: 400 },
    );
  }

  const usedBalance =
    typeof body.usedBalance === "number" ? body.usedBalance : 0;
  if (!Number.isFinite(usedBalance)) {
    return NextResponse.json(
      { error: "usedBalance must be a valid number" },
      { status: 400 },
    );
  }

  const lockedBalance =
    typeof body.lockedBalance === "number" ? body.lockedBalance : 0;
  if (!Number.isFinite(lockedBalance)) {
    return NextResponse.json(
      { error: "lockedBalance must be a valid number" },
      { status: 400 },
    );
  }

  if (!isValidDay(body.billGenerationDay) || !isValidDay(body.billDueDay)) {
    return NextResponse.json(
      {
        error:
          "billGenerationDay and billDueDay must be integers between 1 and 31",
      },
      { status: 400 },
    );
  }

  const row = await createCreditCard({
    userId: session.sub,
    name,
    description: body.description?.trim() ?? "",
    maxBalance: body.maxBalance,
    usedBalance,
    lockedBalance,
    preferredCategories: normalizeCategories(body.preferredCategories),
    billGenerationDay: body.billGenerationDay,
    billDueDay: body.billDueDay,
    previousBillCycleLabel: body.previousBillCycleLabel ?? null,
    previousBillPdfUrl: body.previousBillPdfUrl ?? null,
    previousBillPaid: body.previousBillPaid ?? false,
  });

  return NextResponse.json({ row }, { status: 201 });
}
