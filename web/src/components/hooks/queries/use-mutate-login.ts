"use client";

import { useMutation } from "@tanstack/react-query";

import { loginRequest } from "@/services";

export function useMutateLogin() {
  return useMutation({
    mutationFn: loginRequest,
  });
}
