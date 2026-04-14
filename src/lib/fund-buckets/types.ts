export type FundBucketPriority = "high" | "medium" | "low";

export type FundBucketRow = {
  id: string;
  name: string;
  targetAmount: number;
  bankAccountId: string;
  bankAccountName: string;
  currentValue: number;
  isLocked: boolean;
  priority: FundBucketPriority;
};

export type FundBucketsListState = {
  q: string;
  status: "all" | "locked" | "unlocked";
  priority: "all" | FundBucketPriority;
  sort: string;
};
