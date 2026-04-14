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
  preferredCategories?: string[];
};

export type UpdateBankAccountPayload = {
  accountId: string;
  name?: string;
  description?: string;
  accountType?: BankAccountType;
  balance?: number;
  buckets?: string[];
  preferredCategories?: string[];
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

export async function updateBankAccountRequest({
  accountId,
  ...payload
}: UpdateBankAccountPayload) {
  const res = await fetch(`${getApiRoute("bankAccounts")}/${accountId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: BankAccountRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not update bank account");
  }
  if (!body.row) {
    throw new Error("Bank account was updated but no row was returned");
  }
  return body.row;
}

export async function deleteBankAccountRequest(accountId: string) {
  const res = await fetch(`${getApiRoute("bankAccounts")}/${accountId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    ok?: boolean;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not delete bank account");
  }
  return body.ok ?? true;
}
