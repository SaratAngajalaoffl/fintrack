"use client";

import { useMutation } from "@tanstack/react-query";

import { deleteBankAccountRequest } from "@/services";

export function useMutateDeleteBankAccount() {
  return useMutation({
    mutationFn: deleteBankAccountRequest,
  });
}
