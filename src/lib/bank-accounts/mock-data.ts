import type { BankAccountRow } from "@/lib/bank-accounts/types";

/** Placeholder dataset until APIs and DB are wired. */
export const MOCK_BANK_ACCOUNTS: BankAccountRow[] = [
  {
    id: "1",
    name: "Primary checking",
    description: "Day-to-day expenses and salary deposit",
    accountType: "current",
    balance: 4_250.5,
    creditsThisMonth: 3_200,
    debitsThisMonth: 1_180.25,
    bucketNames: ["Tax", "Bangkok trip"],
  },
  {
    id: "2",
    name: "High-yield savings",
    description: "Emergency fund and short-term goals",
    accountType: "savings",
    balance: 18_900,
    creditsThisMonth: 500,
    debitsThisMonth: 0,
    bucketNames: ["iPhone purchase", "Emergency"],
  },
  {
    id: "3",
    name: "Joint bills",
    description: "Rent, utilities, and subscriptions",
    accountType: "current",
    balance: 2_118.75,
    creditsThisMonth: 800,
    debitsThisMonth: 920,
    bucketNames: ["Rent", "Subscriptions"],
  },
];

export function bankAccountsSummary(accounts: BankAccountRow[]) {
  const totalAccounts = accounts.length;
  const totalBalances = accounts.reduce((s, a) => s + a.balance, 0);
  const totalBuckets = accounts.reduce((s, a) => s + a.bucketNames.length, 0);
  return { totalAccounts, totalBalances, totalBuckets };
}
