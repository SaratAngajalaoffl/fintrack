"use client";

import { useMutation } from "@tanstack/react-query";

import { logoutRequest } from "@/services";

export function useMutateLogout() {
  return useMutation({
    mutationFn: logoutRequest,
  });
}
