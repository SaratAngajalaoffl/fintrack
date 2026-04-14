import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  CATPPUCCIN_MOCHA_COLOR_OPTIONS,
  type CatppuccinMochaColor,
} from "@/lib/expense-categories/types";
import {
  deleteExpenseCategory,
  getExpenseCategoryById,
  updateExpenseCategory,
} from "@/services/expense-categories/expense-categories-db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

type UpdateExpenseCategoryBody = {
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

export async function GET(_: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { categoryId } = await context.params;
  const row = await getExpenseCategoryById(session.sub, categoryId);
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
  let body: UpdateExpenseCategoryBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.color !== undefined && !isValidColor(body.color)) {
    return NextResponse.json(
      { error: "color must be a valid Catppuccin Mocha color token" },
      { status: 400 },
    );
  }

  const { categoryId } = await context.params;
  const row = await updateExpenseCategory({
    userId: session.sub,
    categoryId,
    name: body.name?.trim(),
    description: body.description?.trim(),
    iconUrl: body.iconUrl?.trim(),
    color: body.color,
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
  const { categoryId } = await context.params;
  const deleted = await deleteExpenseCategory(session.sub, categoryId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
