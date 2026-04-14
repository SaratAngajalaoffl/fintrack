/** Domain types for bank accounts (aligned with planned persistence; see docs/data-model.md). */

export type BankAccountType = "savings" | "current";

export type BankAccountRow = {
  id: string;
  name: string;
  description: string;
  accountType: BankAccountType;
  /** Running balance; seeded from initial balance and updated by transactions later. */
  balance: number;
  creditsThisMonth: number;
  debitsThisMonth: number;
  bucketNames: string[];
  preferredCategories: string[];
};

export type BankAccountsListState = {
  /** Case-insensitive search across name, description, buckets, and preferred categories. */
  q: string;
  type: "all" | BankAccountType;
  /** Sort field: name, balance, credits, debits — prefix `-` for descending. */
  sort: string;
};
