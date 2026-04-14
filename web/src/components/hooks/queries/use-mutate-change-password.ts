"use client";

import { useMutation } from "@tanstack/react-query";

import { changePasswordRequest } from "@/services";

export function useMutateChangePassword() {
  return useMutation({
    mutationFn: changePasswordRequest,
  });
}
