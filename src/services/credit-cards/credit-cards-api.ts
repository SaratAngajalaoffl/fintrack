import { getApiRoute } from "@/configs/api-routes";
import type { CreditCardRow } from "@/lib/credit-cards/types";

export async function getCreditCardsRequest(): Promise<CreditCardRow[]> {
  const res = await fetch(getApiRoute("creditCards"), {
    method: "GET",
    credentials: "include",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    rows?: CreditCardRow[];
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load credit cards");
  }
  return body.rows ?? [];
}

export type CreateCreditCardPayload = {
  name: string;
  description?: string;
  maxBalance: number;
  usedBalance: number;
  lockedBalance: number;
  preferredCategories: string[];
  billGenerationDay: number;
  billDueDay: number;
};

export async function createCreditCardRequest(
  payload: CreateCreditCardPayload,
) {
  const res = await fetch(getApiRoute("creditCards"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: CreditCardRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not create credit card");
  }
  if (!body.row) {
    throw new Error("Credit card was created but no row was returned");
  }
  return body.row;
}
