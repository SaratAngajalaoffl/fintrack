"use client";

import * as React from "react";

import { useGetCurrentUser } from "@/components/hooks/queries/use-get-current-user";
import { useMutateUpdateUserProfile } from "@/components/hooks/queries/use-mutate-update-preferred-currency";
import { DEFAULT_CURRENCY, type SupportedCurrency } from "@/lib/user-profile";

type UserProfileContextValue = {
  user: {
    id: string;
    email: string;
    isApproved: boolean;
    name: string;
    preferredCurrency: SupportedCurrency;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUserProfile: (values: {
    name?: string;
    preferredCurrency?: SupportedCurrency;
  }) => Promise<void>;
  setPreferredCurrency: (currency: SupportedCurrency) => Promise<void>;
  refreshUser: () => Promise<unknown>;
};

const UserProfileContext = React.createContext<UserProfileContextValue | null>(
  null,
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUserQuery = useGetCurrentUser();
  const updateProfileMutation = useMutateUpdateUserProfile();

  const user = React.useMemo(() => {
    if (!currentUserQuery.data?.user) return null;
    const data = currentUserQuery.data.user;
    return {
      ...data,
      preferredCurrency: data.preferredCurrency ?? DEFAULT_CURRENCY,
    };
  }, [currentUserQuery.data]);

  const value: UserProfileContextValue = {
    user,
    isLoading: currentUserQuery.isLoading,
    isAuthenticated: !!user,
    updateUserProfile: async (values) => {
      await updateProfileMutation.mutateAsync(values);
    },
    setPreferredCurrency: async (currency) => {
      await updateProfileMutation.mutateAsync({ preferredCurrency: currency });
    },
    refreshUser: () => currentUserQuery.refetch(),
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = React.useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}
