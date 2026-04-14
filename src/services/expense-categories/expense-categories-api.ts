import { getApiRoute } from "@/configs/api-routes";
import type {
  CatppuccinMochaColor,
  ExpenseCategoryRow,
} from "@/lib/expense-categories/types";

export async function getExpenseCategoriesRequest(): Promise<
  ExpenseCategoryRow[]
> {
  const res = await fetch(getApiRoute("expenseCategories"), {
    method: "GET",
    credentials: "include",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    rows?: ExpenseCategoryRow[];
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load expense categories");
  }
  return body.rows ?? [];
}

export type CreateExpenseCategoryPayload = {
  name: string;
  description?: string;
  iconUrl: string;
  color: CatppuccinMochaColor;
};

export async function createExpenseCategoryRequest(
  payload: CreateExpenseCategoryPayload,
) {
  const res = await fetch(getApiRoute("expenseCategories"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: ExpenseCategoryRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not create expense category");
  }
  if (!body.row) {
    throw new Error("Expense category was created but no row was returned");
  }
  return body.row;
}
