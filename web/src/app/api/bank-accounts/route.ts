import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import type { BankAccountType } from "@/lib/bank-accounts/types";
import {
  createBankAccount,
  listBankAccounts,
} from "@/services/bank-accounts/bank-accounts-db";

export const runtime = "nodejs";

type CreateBankAccountBody = {
  name?: string;
  description?: string;
  initialBalance?: number;
  accountType?: BankAccountType;
  preferredCategories?: string[];
};

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

  const rows = await listBankAccounts(session.sub);
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBankAccountBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "Bank account name is required" },
      { status: 400 },
    );
  }

  const accountType =
    body.accountType === "savings" || body.accountType === "current"
      ? body.accountType
      : null;
  if (!accountType) {
    return NextResponse.json(
      { error: "accountType must be savings or current" },
      { status: 400 },
    );
  }

  const initialBalance =
    typeof body.initialBalance === "number" ? body.initialBalance : 0;
  if (!Number.isFinite(initialBalance)) {
    return NextResponse.json(
      { error: "initialBalance must be a number" },
      { status: 400 },
    );
  }

  const account = await createBankAccount({
    userId: session.sub,
    name,
    description: body.description?.trim() ?? "",
    accountType,
    initialBalance,
    preferredCategories: normalizeCategories(body.preferredCategories),
  });

  return NextResponse.json({ row: account }, { status: 201 });
}
