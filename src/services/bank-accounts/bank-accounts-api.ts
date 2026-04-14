import { MOCK_BANK_ACCOUNTS } from "@/lib/bank-accounts/mock-data";
import type { BankAccountRow } from "@/lib/bank-accounts/types";

const MOCK_DELAY_MS = 2_000;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Temporary mocked fetch until backend endpoint is ready.
 * Keep this signature stable so callers can switch to real API seamlessly.
 */
export async function getBankAccountsRequest(): Promise<BankAccountRow[]> {
  await wait(MOCK_DELAY_MS);
  return MOCK_BANK_ACCOUNTS;
}
