"use client";

import { useMutation } from "@tanstack/react-query";

import { forgotPasswordRequest } from "@/services";

export function useMutateForgotPassword() {
  return useMutation({
    mutationFn: forgotPasswordRequest,
  });
}
