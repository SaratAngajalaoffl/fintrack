import { getApiRoute } from "@/configs/api-routes";
import type {
  FundBucketPriority,
  FundBucketRow,
} from "@/lib/fund-buckets/types";

export async function getFundBucketsRequest(): Promise<FundBucketRow[]> {
  const res = await fetch(getApiRoute("fundBuckets"), {
    method: "GET",
    credentials: "include",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    rows?: FundBucketRow[];
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load fund buckets");
  }
  return body.rows ?? [];
}

export type CreateFundBucketPayload = {
  name: string;
  targetAmount: number;
  bankAccountId: string;
  priority: FundBucketPriority;
};

export async function createFundBucketRequest(
  payload: CreateFundBucketPayload,
) {
  const res = await fetch(getApiRoute("fundBuckets"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: FundBucketRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not create fund bucket");
  }
  if (!body.row) {
    throw new Error("Fund bucket was created but no row was returned");
  }
  return body.row;
}

export type AllocateFundsPayload = {
  bucketId: string;
  amount: number;
};

export async function allocateFundBucketRequest({
  bucketId,
  amount,
}: AllocateFundsPayload) {
  const res = await fetch(
    getApiRoute("fundBucketAllocate", {
      bucketId,
    }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount }),
    },
  );
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: FundBucketRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not allocate funds to fund bucket");
  }
  if (!body.row) {
    throw new Error("Fund bucket was updated but no row was returned");
  }
  return body.row;
}

export async function unlockFundBucketRequest(bucketId: string) {
  const res = await fetch(
    getApiRoute("fundBucketUnlock", {
      bucketId,
    }),
    {
      method: "POST",
      credentials: "include",
    },
  );
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: FundBucketRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not unlock fund bucket");
  }
  if (!body.row) {
    throw new Error("Fund bucket was updated but no row was returned");
  }
  return body.row;
}

export type SetFundBucketPriorityPayload = {
  bucketId: string;
  priority: FundBucketPriority;
};

export async function setFundBucketPriorityRequest({
  bucketId,
  priority,
}: SetFundBucketPriorityPayload) {
  const res = await fetch(
    getApiRoute("fundBucketPriority", {
      bucketId,
    }),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ priority }),
    },
  );
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    row?: FundBucketRow;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not set fund bucket priority");
  }
  if (!body.row) {
    throw new Error("Fund bucket was updated but no row was returned");
  }
  return body.row;
}
