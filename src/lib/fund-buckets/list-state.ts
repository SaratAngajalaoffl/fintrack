import { getAppRoute } from "@/configs/app-routes";
import type {
  FundBucketPriority,
  FundBucketsListState,
  FundBucketRow,
} from "@/lib/fund-buckets/types";

const PATH = getAppRoute("dashboardFundBuckets");

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePriority(value: string | undefined): "all" | FundBucketPriority {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "all";
}

function parseStatus(value: string | undefined): "all" | "locked" | "unlocked" {
  if (value === "locked" || value === "unlocked") return value;
  return "all";
}

export function parseFundBucketsListState(
  raw: Record<string, string | string[] | undefined>,
): FundBucketsListState {
  const q = first(raw.q)?.trim() ?? "";
  const status = parseStatus(first(raw.status)?.trim());
  const priority = parsePriority(first(raw.priority)?.trim());
  const sort = first(raw.sort)?.trim() || "-progress";
  return { q, status, priority, sort };
}

export function fundBucketsListToSearchParams(
  state: FundBucketsListState,
): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.status !== "all") params.set("status", state.status);
  if (state.priority !== "all") params.set("priority", state.priority);
  if (state.sort && state.sort !== "-progress") params.set("sort", state.sort);
  return params;
}

export function fundBucketsListHref(
  base: FundBucketsListState,
  overrides: Partial<FundBucketsListState>,
): string {
  const next: FundBucketsListState = { ...base, ...overrides };
  const p = fundBucketsListToSearchParams(next);
  const s = p.toString();
  return s ? `${PATH}?${s}` : PATH;
}

function progress(row: FundBucketRow): number {
  if (row.targetAmount <= 0) return 0;
  return row.currentValue / row.targetAmount;
}

export function filterAndSortFundBuckets(
  rows: FundBucketRow[],
  state: FundBucketsListState,
): FundBucketRow[] {
  let list = [...rows];

  if (state.q) {
    const needle = state.q.toLowerCase();
    list = list.filter(
      (row) =>
        row.name.toLowerCase().includes(needle) ||
        row.bankAccountName.toLowerCase().includes(needle),
    );
  }

  if (state.status !== "all") {
    const shouldBeLocked = state.status === "locked";
    list = list.filter((row) => row.isLocked === shouldBeLocked);
  }

  if (state.priority !== "all") {
    list = list.filter((row) => row.priority === state.priority);
  }

  const desc = state.sort.startsWith("-");
  const key = desc ? state.sort.slice(1) : state.sort;
  const mult = desc ? -1 : 1;

  list.sort((a, b) => {
    switch (key) {
      case "bankAccount":
        return mult * a.bankAccountName.localeCompare(b.bankAccountName);
      case "target":
        return mult * (a.targetAmount - b.targetAmount);
      case "current":
        return mult * (a.currentValue - b.currentValue);
      case "priority":
        return mult * a.priority.localeCompare(b.priority);
      case "progress":
      default:
        return mult * (progress(a) - progress(b));
    }
  });

  return list;
}
