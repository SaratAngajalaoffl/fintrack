"use client";

import { useGetBankAccounts } from "@/components/hooks";
import { ShimmerComponent } from "@/components/ui";
import { filterAndSortBankAccounts } from "@/lib/bank-accounts/list-state";
import { bankAccountsSummary } from "@/lib/bank-accounts/mock-data";
import type { BankAccountsListState } from "@/lib/bank-accounts/types";

import { BankAccountsSummaryCards } from "./bank-accounts-summary-cards";
import { BankAccountsTablePanel } from "./bank-accounts-table-panel";

type BankAccountsDataPanelProps = {
  listState: BankAccountsListState;
};

export function BankAccountsDataPanel({
  listState,
}: BankAccountsDataPanelProps) {
  const bankAccountsQuery = useGetBankAccounts();

  if (bankAccountsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
            <ShimmerComponent className="h-6 w-24" />
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

  if (bankAccountsQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
        Could not load bank accounts. Please refresh and try again.
      </div>
    );
  }

  const allAccounts = bankAccountsQuery.data ?? [];
  const summary = bankAccountsSummary(allAccounts);
  const rows = filterAndSortBankAccounts(allAccounts, listState);

  return (
    <>
      <BankAccountsSummaryCards
        totalAccounts={summary.totalAccounts}
        totalBalances={summary.totalBalances}
        totalBuckets={summary.totalBuckets}
      />
      <BankAccountsTablePanel listState={listState} rows={rows} />
    </>
  );
}
