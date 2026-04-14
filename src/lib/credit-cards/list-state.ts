import type {
  CreditCardCategory,
  CreditCardsListState,
  CreditCardRow,
} from "@/lib/credit-cards/types";

const PATH = "/dashboard/credit-cards";
const ALLOWED_CATEGORIES: CreditCardCategory[] = [
  "Groceries",
  "Rent",
  "Travel",
  "Dining",
  "Shopping",
  "Utilities",
];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseCreditCardsListState(
  raw: Record<string, string | string[] | undefined>,
): CreditCardsListState {
  const q = first(raw.q)?.trim() ?? "";
  const categoryRaw = first(raw.category)?.trim();
  const category =
    categoryRaw &&
    ALLOWED_CATEGORIES.includes(categoryRaw as CreditCardCategory)
      ? (categoryRaw as CreditCardCategory)
      : "all";
  const sort = first(raw.sort)?.trim() || "name";
  return { q, category, sort };
}

export function creditCardsListToSearchParams(
  state: CreditCardsListState,
): URLSearchParams {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.category !== "all") p.set("category", state.category);
  if (state.sort && state.sort !== "name") p.set("sort", state.sort);
  return p;
}

export function creditCardsListHref(
  base: CreditCardsListState,
  overrides: Partial<CreditCardsListState>,
): string {
  const next: CreditCardsListState = { ...base, ...overrides };
  const p = creditCardsListToSearchParams(next);
  const s = p.toString();
  return s ? `${PATH}?${s}` : PATH;
}

export function getBillGenerationInDays(generationDay: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const today = now.getDate();

  if (generationDay >= today) {
    return generationDay - today;
  }

  const nextMonthDate = new Date(currentYear, currentMonth + 1, generationDay);
  const oneDayMs = 1000 * 60 * 60 * 24;
  return Math.ceil((nextMonthDate.getTime() - now.getTime()) / oneDayMs);
}

export function filterAndSortCreditCards(
  rows: CreditCardRow[],
  state: CreditCardsListState,
): CreditCardRow[] {
  let list = [...rows];

  if (state.q) {
    const needle = state.q.toLowerCase();
    list = list.filter(
      (row) =>
        row.name.toLowerCase().includes(needle) ||
        row.description.toLowerCase().includes(needle) ||
        row.preferredCategories.some((category) =>
          category.toLowerCase().includes(needle),
        ),
    );
  }

  if (state.category !== "all") {
    list = list.filter((row) =>
      row.preferredCategories.includes(state.category),
    );
  }

  const desc = state.sort.startsWith("-");
  const key = desc ? state.sort.slice(1) : state.sort;
  const mult = desc ? -1 : 1;

  list.sort((a, b) => {
    const utilA = a.maxBalance > 0 ? a.usedBalance / a.maxBalance : 0;
    const utilB = b.maxBalance > 0 ? b.usedBalance / b.maxBalance : 0;

    switch (key) {
      case "max":
        return mult * (a.maxBalance - b.maxBalance);
      case "used":
        return mult * (a.usedBalance - b.usedBalance);
      case "locked":
        return mult * (a.lockedBalance - b.lockedBalance);
      case "utilization":
        return mult * (utilA - utilB);
      case "billGenerationIn":
        return (
          mult *
          (getBillGenerationInDays(a.billGenerationDay) -
            getBillGenerationInDays(b.billGenerationDay))
        );
      case "name":
      default:
        return mult * a.name.localeCompare(b.name);
    }
  });

  return list;
}
