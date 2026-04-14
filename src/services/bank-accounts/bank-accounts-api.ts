import { getApiRoute } from "@/configs/api-routes";
import type {
  BankAccountRow,
  BankAccountType,
} from "@/lib/bank-accounts/types";

export async function getBankAccountsRequest(): Promise<BankAccountRow[]> {
  const res = await fetch(getApiRoute("bankAccounts"), {
    method: "GET",
    credentials: "include",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    rows?: BankAccountRow[];
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load bank accounts");
  }
  return body.rows ?? [];
}

export type CreateBankAccountPayload = {
  name: string;
  description?: string;
  initialBalance: number;
  accountType: BankAccountType;
};

export async function createBankAccountRequest(
  payload: CreateBankAccountPayload,
) {
  const res = await fetch(getApiRoute("bankAccounts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: BankAccountRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not create bank account");
  }
  if (!body.row) {
    throw new Error("Bank account was created but no row was returned");
  }
  return body.row;
}
