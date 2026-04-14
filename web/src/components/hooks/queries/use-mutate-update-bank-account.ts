"use client";

import { useMutation } from "@tanstack/react-query";

import { updateBankAccountRequest } from "@/services";

export function useMutateUpdateBankAccount() {
  return useMutation({
    mutationFn: updateBankAccountRequest,
  });
}
