"use client";

import { useQuery } from "@tanstack/react-query";

import { getFundBucketsRequest } from "@/services";

export function useGetFundBuckets() {
  return useQuery({
    queryKey: ["fund-buckets", "list"],
    queryFn: getFundBucketsRequest,
  });
}
