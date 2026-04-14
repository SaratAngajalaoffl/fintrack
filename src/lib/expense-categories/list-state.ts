import type {
  ExpenseCategoriesListState,
  ExpenseCategoryRow,
} from "@/lib/expense-categories/types";

const PATH = "/dashboard/expenses";

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseExpenseCategoriesListState(
  raw: Record<string, string | string[] | undefined>,
): ExpenseCategoriesListState {
  const q = first(raw.q)?.trim() ?? "";
  const sort = first(raw.sort)?.trim() || "name";
  return { q, sort };
}

export function expenseCategoriesListToSearchParams(
  state: ExpenseCategoriesListState,
): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.sort && state.sort !== "name") params.set("sort", state.sort);
  return params;
}

export function expenseCategoriesListHref(
  base: ExpenseCategoriesListState,
  overrides: Partial<ExpenseCategoriesListState>,
): string {
  const next: ExpenseCategoriesListState = { ...base, ...overrides };
  const params = expenseCategoriesListToSearchParams(next);
  const queryString = params.toString();
  return queryString ? `${PATH}?${queryString}` : PATH;
}

export function filterAndSortExpenseCategories(
  rows: ExpenseCategoryRow[],
  state: ExpenseCategoriesListState,
): ExpenseCategoryRow[] {
  let list = [...rows];

  if (state.q) {
    const needle = state.q.toLowerCase();
    list = list.filter(
      (row) =>
        row.name.toLowerCase().includes(needle) ||
        row.description.toLowerCase().includes(needle) ||
        row.color.toLowerCase().includes(needle),
    );
  }

  const desc = state.sort.startsWith("-");
  const key = desc ? state.sort.slice(1) : state.sort;
  const mult = desc ? -1 : 1;

  list.sort((a, b) => {
    switch (key) {
      case "color":
        return mult * a.color.localeCompare(b.color);
      case "name":
      default:
        return mult * a.name.localeCompare(b.name);
    }
  });

  return list;
}
