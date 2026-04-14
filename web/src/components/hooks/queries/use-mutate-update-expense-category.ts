"use client";

import { useMutation } from "@tanstack/react-query";

import { updateExpenseCategoryRequest } from "@/services";

export function useMutateUpdateExpenseCategory() {
  return useMutation({
    mutationFn: updateExpenseCategoryRequest,
  });
}
