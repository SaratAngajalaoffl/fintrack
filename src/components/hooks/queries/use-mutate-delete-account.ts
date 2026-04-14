"use client";

import { useMutation } from "@tanstack/react-query";

import { deleteAccountRequest } from "@/services";

export function useMutateDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccountRequest,
  });
}
