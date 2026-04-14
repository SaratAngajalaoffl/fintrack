import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import type { BankAccountType } from "@/lib/bank-accounts/types";
import {
  deleteBankAccount,
  getBankAccountById,
  updateBankAccount,
} from "@/services/bank-accounts/bank-accounts-db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ accountId: string }>;
};

type UpdateBankAccountBody = {
  name?: string;
  description?: string;
  accountType?: BankAccountType;
  balance?: number;
  lastDebitAt?: string | null;
  lastCreditAt?: string | null;
  buckets?: string[];
  preferredCategories?: string[];
};

function normalizeBuckets(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  return input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
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

  const { accountId } = await context.params;
  const row = await getBankAccountById(session.sub, accountId);
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

  let body: UpdateBankAccountBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const accountType =
    body.accountType === undefined ||
    body.accountType === "savings" ||
    body.accountType === "current"
      ? body.accountType
      : null;
  if (accountType === null) {
    return NextResponse.json(
      { error: "accountType must be savings or current" },
      { status: 400 },
    );
  }

  if (body.balance !== undefined && !Number.isFinite(body.balance)) {
    return NextResponse.json(
      { error: "balance must be a number" },
      { status: 400 },
    );
  }

  const { accountId } = await context.params;
  const row = await updateBankAccount({
    userId: session.sub,
    accountId,
    name: body.name?.trim(),
    description: body.description?.trim(),
    accountType,
    balance: body.balance,
    lastDebitAt: body.lastDebitAt,
    lastCreditAt: body.lastCreditAt,
    buckets: normalizeBuckets(body.buckets),
    preferredCategories: normalizeCategories(body.preferredCategories),
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

  const { accountId } = await context.params;
  const deleted = await deleteBankAccount(session.sub, accountId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
