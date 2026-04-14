"use client";

import { useGetCreditCards } from "@/components/hooks";
import { ShimmerComponent } from "@/components/ui";
import {
  allCreditCardCategories,
  creditCardsSummary,
} from "@/lib/credit-cards/mock-data";
import { filterAndSortCreditCards } from "@/lib/credit-cards/list-state";
import type { CreditCardsListState } from "@/lib/credit-cards/types";

import { CreditCardsSummaryCards } from "./credit-cards-summary-cards";
import { CreditCardsTablePanel } from "./credit-cards-table-panel";

type CreditCardsDataPanelProps = {
  listState: CreditCardsListState;
};

export function CreditCardsDataPanel({ listState }: CreditCardsDataPanelProps) {
  const creditCardsQuery = useGetCreditCards();

  if (creditCardsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`summary-skeleton-${index}`}
              className="rounded-xl border border-border/70 bg-surface-0/60 p-4 shadow-sm"
            >
              <ShimmerComponent className="h-4 w-24" />
              <ShimmerComponent className="mt-4 h-8 w-32" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-0/40 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <ShimmerComponent className="h-6 w-28" />
            <div className="flex items-center gap-2">
              <ShimmerComponent className="h-8 w-8 rounded-lg" />
              <ShimmerComponent className="h-8 w-8 rounded-lg" />
              <ShimmerComponent className="h-8 w-36 rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <ShimmerComponent className="h-10 w-full rounded-lg" />
            {Array.from({ length: 5 }).map((_, index) => (
              <ShimmerComponent
                key={`row-skeleton-${index}`}
                className="h-12 w-full rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (creditCardsQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
        Could not load credit cards. Please refresh and try again.
      </div>
    );
  }

  const rows = creditCardsQuery.data ?? [];
  const summary = creditCardsSummary(rows);
  const filteredRows = filterAndSortCreditCards(rows, listState);
  const categories = allCreditCardCategories(rows);

  return (
    <>
      <CreditCardsSummaryCards
        numberOfCards={summary.numberOfCards}
        totalBalance={summary.totalBalance}
        totalUsage={summary.totalUsage}
        totalLocked={summary.totalLocked}
      />
      <CreditCardsTablePanel
        listState={listState}
        rows={filteredRows}
        availableCategories={categories}
      />
    </>
  );
}
