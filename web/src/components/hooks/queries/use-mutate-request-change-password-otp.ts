"use client";

import { useMutation } from "@tanstack/react-query";

import { requestChangePasswordOtp } from "@/services";

export function useMutateRequestChangePasswordOtp() {
  return useMutation({
    mutationFn: requestChangePasswordOtp,
  });
}
