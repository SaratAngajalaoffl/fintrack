"use client";

import { useMutation } from "@tanstack/react-query";

import { exportAccountDataRequest } from "@/services";

export function useMutateExportAccountData() {
  return useMutation({
    mutationFn: exportAccountDataRequest,
  });
}
