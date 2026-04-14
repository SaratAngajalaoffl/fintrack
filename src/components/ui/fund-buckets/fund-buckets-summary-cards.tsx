"use client";

import { useUserProfile } from "@/components/hooks";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/formatting/number-formatting";

export type FundBucketsSummaryCardsProps = {
  totalBuckets: number;
  totalLocked: number;
  totalTarget: number;
  completedBuckets: number;
};

export function FundBucketsSummaryCards({
  totalBuckets,
  totalLocked,
  totalTarget,
  completedBuckets,
}: FundBucketsSummaryCardsProps) {
  const { user } = useUserProfile();
  const preferredCurrency = user?.preferredCurrency ?? "USD";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-border/70 bg-surface-0/60 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-subtext-1">
          Fund buckets
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatNumber(totalBuckets)}
        </p>
      </div>
      <div className="rounded-xl border border-border/70 bg-surface-0/60 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-subtext-1">
          Total locked
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatCurrency(totalLocked, preferredCurrency)}
        </p>
      </div>
      <div className="rounded-xl border border-border/70 bg-surface-0/60 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-subtext-1">
          Total target
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatCurrency(totalTarget, preferredCurrency)}
        </p>
      </div>
      <div className="rounded-xl border border-border/70 bg-surface-0/60 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-subtext-1">
          Completed
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatNumber(completedBuckets)}
        </p>
      </div>
    </div>
  );
}
