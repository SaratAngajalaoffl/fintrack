"use client";

import { useMutation } from "@tanstack/react-query";

import { unlockFundBucketRequest } from "@/services";

export function useMutateUnlockFundBucket() {
  return useMutation({
    mutationFn: unlockFundBucketRequest,
  });
}
