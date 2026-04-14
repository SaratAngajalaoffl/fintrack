"use client";

import { useMutation } from "@tanstack/react-query";

import { createCreditCardRequest } from "@/services";

export function useMutateCreateCreditCard() {
  return useMutation({
    mutationFn: createCreditCardRequest,
  });
}
