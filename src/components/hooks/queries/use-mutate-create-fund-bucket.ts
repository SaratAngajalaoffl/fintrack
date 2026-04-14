"use client";

import { useMutation } from "@tanstack/react-query";

import { createFundBucketRequest } from "@/services";

export function useMutateCreateFundBucket() {
  return useMutation({
    mutationFn: createFundBucketRequest,
  });
}
