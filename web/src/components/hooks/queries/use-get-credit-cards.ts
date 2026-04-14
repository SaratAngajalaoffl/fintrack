"use client";

import { useQuery } from "@tanstack/react-query";

import { getCreditCardsRequest } from "@/services";

export function useGetCreditCards() {
  return useQuery({
    queryKey: ["credit-cards", "list"],
    queryFn: getCreditCardsRequest,
  });
}
