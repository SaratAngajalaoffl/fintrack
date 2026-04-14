"use client";

import { useMutation } from "@tanstack/react-query";

import { createExpenseCategoryRequest } from "@/services";

export function useMutateCreateExpenseCategory() {
  return useMutation({
    mutationFn: createExpenseCategoryRequest,
  });
}
