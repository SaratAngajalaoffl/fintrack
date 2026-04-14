"use client";

import { useGetExpenseCategories } from "@/components/hooks";
import { ShimmerComponent } from "@/components/ui";
import { filterAndSortExpenseCategories } from "@/lib/expense-categories/list-state";
import type { ExpenseCategoriesListState } from "@/lib/expense-categories/types";

import { ExpenseCategoriesTablePanel } from "./expense-categories-table-panel";

type ExpenseCategoriesDataPanelProps = {
  listState: ExpenseCategoriesListState;
};

export function ExpenseCategoriesDataPanel({
  listState,
}: ExpenseCategoriesDataPanelProps) {
  const expenseCategoriesQuery = useGetExpenseCategories();

  if (expenseCategoriesQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-surface-0/40 p-4 shadow-sm">
        <ShimmerComponent className="h-10 w-full rounded-lg" />
        <div className="mt-2 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <ShimmerComponent
              key={`row-skeleton-${index}`}
              className="h-12 w-full rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (expenseCategoriesQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
        Could not load expense categories. Please refresh and try again.
      </div>
    );
  }

  const rows = expenseCategoriesQuery.data ?? [];
  const filteredRows = filterAndSortExpenseCategories(rows, listState);

  return (
    <ExpenseCategoriesTablePanel listState={listState} rows={filteredRows} />
  );
}
