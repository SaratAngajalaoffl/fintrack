import type { BankAccountsListState } from "@/lib/bank-accounts/types";

const PATH = "/dashboard/bank-accounts";

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseBankAccountsListState(
  raw: Record<string, string | string[] | undefined>,
): BankAccountsListState {
  const q = first(raw.q)?.trim() ?? "";
  const typeRaw = first(raw.type);
  const type = typeRaw === "savings" || typeRaw === "current" ? typeRaw : "all";
  const sort = first(raw.sort)?.trim() || "name";
  return { q, type, sort };
}

export function bankAccountsListToSearchParams(
  state: BankAccountsListState,
): URLSearchParams {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.type !== "all") p.set("type", state.type);
  if (state.sort && state.sort !== "name") p.set("sort", state.sort);
  return p;
}

/** Build list URL with overrides applied on top of `base`. */
export function bankAccountsListHref(
  base: BankAccountsListState,
  overrides: Partial<BankAccountsListState>,
): string {
  const next: BankAccountsListState = { ...base, ...overrides };
  const p = bankAccountsListToSearchParams(next);
  const s = p.toString();
  return s ? `${PATH}?${s}` : PATH;
}

/** Apply search, type filter, and sort to rows (server-side; mirrors future API). */
export function filterAndSortBankAccounts<
  T extends {
    name: string;
    description: string;
    accountType: string;
    balance: number;
    creditsThisMonth: number;
    debitsThisMonth: number;
    bucketNames: string[];
  },
>(rows: T[], state: BankAccountsListState): T[] {
  let list = [...rows];

  if (state.q) {
    const needle = state.q.toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) ||
        a.description.toLowerCase().includes(needle) ||
        a.bucketNames.some((b) => b.toLowerCase().includes(needle)),
    );
  }

  if (state.type !== "all") {
    list = list.filter((a) => a.accountType === state.type);
  }

  const desc = state.sort.startsWith("-");
  const key = desc ? state.sort.slice(1) : state.sort;
  const mult = desc ? -1 : 1;

  list.sort((a, b) => {
    switch (key) {
      case "balance":
        return mult * (a.balance - b.balance);
      case "credits":
        return mult * (a.creditsThisMonth - b.creditsThisMonth);
      case "debits":
        return mult * (a.debitsThisMonth - b.debitsThisMonth);
      case "name":
      default:
        return mult * a.name.localeCompare(b.name);
    }
  });

  return list;
}
