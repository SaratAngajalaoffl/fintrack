"use client";

import { useMutation } from "@tanstack/react-query";

import { deleteExpenseCategoryRequest } from "@/services";

export function useMutateDeleteExpenseCategory() {
  return useMutation({
    mutationFn: deleteExpenseCategoryRequest,
  });
}
