"use client";

import { useQuery } from "@tanstack/react-query";

import { getExpenseCategoriesRequest } from "@/services";

export function useGetExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories", "list"],
    queryFn: getExpenseCategoriesRequest,
  });
}
