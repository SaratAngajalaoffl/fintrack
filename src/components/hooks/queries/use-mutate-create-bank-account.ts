"use client";

import { useMutation } from "@tanstack/react-query";

import { createBankAccountRequest } from "@/services";

export function useMutateCreateBankAccount() {
  return useMutation({
    mutationFn: createBankAccountRequest,
  });
}
