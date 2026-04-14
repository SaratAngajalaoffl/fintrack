import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  deleteCreditCard,
  getCreditCardById,
  updateCreditCard,
} from "@/services/credit-cards/credit-cards-db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ cardId: string }>;
};

type UpdateCreditCardBody = {
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

function normalizeCategories(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  return input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export async function GET(_: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await context.params;
  const row = await getCreditCardById(session.sub, cardId);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ row });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateCreditCardBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.maxBalance !== undefined && !Number.isFinite(body.maxBalance)) {
    return NextResponse.json(
      { error: "maxBalance must be a valid number" },
      { status: 400 },
    );
  }
  if (body.usedBalance !== undefined && !Number.isFinite(body.usedBalance)) {
    return NextResponse.json(
      { error: "usedBalance must be a valid number" },
      { status: 400 },
    );
  }
  if (
    body.lockedBalance !== undefined &&
    !Number.isFinite(body.lockedBalance)
  ) {
    return NextResponse.json(
      { error: "lockedBalance must be a valid number" },
      { status: 400 },
    );
  }
  if (
    (body.billGenerationDay !== undefined &&
      !isValidDay(body.billGenerationDay)) ||
    (body.billDueDay !== undefined && !isValidDay(body.billDueDay))
  ) {
    return NextResponse.json(
      {
        error:
          "billGenerationDay and billDueDay must be integers between 1 and 31",
      },
      { status: 400 },
    );
  }

  const { cardId } = await context.params;
  const row = await updateCreditCard({
    userId: session.sub,
    cardId,
    name: body.name?.trim(),
    description: body.description?.trim(),
    maxBalance: body.maxBalance,
    usedBalance: body.usedBalance,
    lockedBalance: body.lockedBalance,
    preferredCategories: normalizeCategories(body.preferredCategories),
    billGenerationDay: body.billGenerationDay,
    billDueDay: body.billDueDay,
    previousBillCycleLabel: body.previousBillCycleLabel,
    previousBillPdfUrl: body.previousBillPdfUrl,
    previousBillPaid: body.previousBillPaid,
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ row });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await context.params;
  const deleted = await deleteCreditCard(session.sub, cardId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
