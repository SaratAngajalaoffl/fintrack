"use client";

import { useMutation } from "@tanstack/react-query";

import { setFundBucketPriorityRequest } from "@/services";

export function useMutateSetFundBucketPriority() {
  return useMutation({
    mutationFn: setFundBucketPriorityRequest,
  });
}
