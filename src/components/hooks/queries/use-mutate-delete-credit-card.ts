"use client";

import { useMutation } from "@tanstack/react-query";

import { deleteCreditCardRequest } from "@/services";

export function useMutateDeleteCreditCard() {
  return useMutation({
    mutationFn: deleteCreditCardRequest,
  });
}
