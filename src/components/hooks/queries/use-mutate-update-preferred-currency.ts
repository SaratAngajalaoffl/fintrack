"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY } from "@/components/hooks/queries/use-get-current-user";
import { updateUserProfileRequest } from "@/services";

export function useMutateUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfileRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, {
        user: data.user ?? null,
      });
    },
  });
}
