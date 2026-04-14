import type { FundBucketRow } from "@/lib/fund-buckets/types";

export function fundBucketsSummary(rows: FundBucketRow[]) {
  const totalBuckets = rows.length;
  const totalLocked = rows
    .filter((row) => row.isLocked)
    .reduce((sum, row) => sum + row.currentValue, 0);
  const totalTarget = rows.reduce((sum, row) => sum + row.targetAmount, 0);
  const completedBuckets = rows.filter(
    (row) => row.currentValue >= row.targetAmount,
  ).length;

  return {
    totalBuckets,
    totalLocked,
    totalTarget,
    completedBuckets,
  };
}
