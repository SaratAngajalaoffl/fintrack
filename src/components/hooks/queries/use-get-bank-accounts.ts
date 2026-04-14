"use client";

import { useQuery } from "@tanstack/react-query";

import { getBankAccountsRequest } from "@/services";

export function useGetBankAccounts() {
  return useQuery({
    queryKey: ["bank-accounts", "list"],
    queryFn: getBankAccountsRequest,
  });
}
