"use client";

import { useMutation } from "@tanstack/react-query";

import { resetPasswordRequest } from "@/services";

export function useMutateResetPassword() {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
}
