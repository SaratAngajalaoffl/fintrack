"use client";

import { useGetFundBuckets } from "@/components/hooks";
import { ShimmerComponent } from "@/components/ui";
import { filterAndSortFundBuckets } from "@/lib/fund-buckets/list-state";
import { fundBucketsSummary } from "@/lib/fund-buckets/mock-data";
import type { FundBucketsListState } from "@/lib/fund-buckets/types";

import { FundBucketsSummaryCards } from "./fund-buckets-summary-cards";
import { FundBucketsTablePanel } from "./fund-buckets-table-panel";

type FundBucketsDataPanelProps = {
  listState: FundBucketsListState;
};

export function FundBucketsDataPanel({ listState }: FundBucketsDataPanelProps) {
  const fundBucketsQuery = useGetFundBuckets();

  if (fundBucketsQuery.isLoading) {
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
      </div>
    );
  }

  if (fundBucketsQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
        Could not load fund buckets. Please refresh and try again.
      </div>
    );
  }

  const rows = fundBucketsQuery.data ?? [];
  const summary = fundBucketsSummary(rows);
  const filteredRows = filterAndSortFundBuckets(rows, listState);

  return (
    <>
      <FundBucketsSummaryCards
        totalBuckets={summary.totalBuckets}
        totalLocked={summary.totalLocked}
        totalTarget={summary.totalTarget}
        completedBuckets={summary.completedBuckets}
      />
      <FundBucketsTablePanel
        listState={listState}
        rows={filteredRows}
        allRows={rows}
      />
    </>
  );
}
