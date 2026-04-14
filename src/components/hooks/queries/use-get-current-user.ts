"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUserRequest } from "@/services";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

export function useGetCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUserRequest,
  });
}
