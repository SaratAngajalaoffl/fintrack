"use client";

import { useMutation } from "@tanstack/react-query";

import { updateCreditCardRequest } from "@/services";

export function useMutateUpdateCreditCard() {
  return useMutation({
    mutationFn: updateCreditCardRequest,
  });
}
