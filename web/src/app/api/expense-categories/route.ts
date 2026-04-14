import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  CATPPUCCIN_MOCHA_COLOR_OPTIONS,
  type CatppuccinMochaColor,
} from "@/lib/expense-categories/types";
import {
  createExpenseCategory,
  listExpenseCategories,
} from "@/services/expense-categories/expense-categories-db";

export const runtime = "nodejs";

type CreateExpenseCategoryBody = {
  name?: string;
  description?: string;
  iconUrl?: string;
  color?: CatppuccinMochaColor;
};

function isValidColor(color: unknown): color is CatppuccinMochaColor {
  return (
    typeof color === "string" &&
    CATPPUCCIN_MOCHA_COLOR_OPTIONS.includes(color as CatppuccinMochaColor)
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listExpenseCategories(session.sub);
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateExpenseCategoryBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "Category name is required" },
      { status: 400 },
    );
  }
  const iconUrl = body.iconUrl?.trim() ?? "";
  if (!iconUrl) {
    return NextResponse.json(
      { error: "Category icon URL is required" },
      { status: 400 },
    );
  }
  if (!isValidColor(body.color)) {
    return NextResponse.json(
      { error: "color must be a valid Catppuccin Mocha color token" },
      { status: 400 },
    );
  }

  const row = await createExpenseCategory({
    userId: session.sub,
    name,
    description: body.description?.trim() ?? "",
    iconUrl,
    color: body.color,
  });

  return NextResponse.json({ row }, { status: 201 });
}
