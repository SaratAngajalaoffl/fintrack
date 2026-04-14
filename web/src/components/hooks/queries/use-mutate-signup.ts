"use client";

import { useMutation } from "@tanstack/react-query";

import { signupRequest } from "@/services";

export function useMutateSignup() {
  return useMutation({
    mutationFn: signupRequest,
  });
}
