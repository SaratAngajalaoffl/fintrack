"use client";

import { useMutation } from "@tanstack/react-query";

import { allocateFundBucketRequest } from "@/services";

export function useMutateAllocateFundBucket() {
  return useMutation({
    mutationFn: allocateFundBucketRequest,
  });
}
