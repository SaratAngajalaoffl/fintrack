"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useMutateDeleteAccount,
  useMutateExportAccountData,
  useUserProfile,
} from "@/components/hooks";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SelectField,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import { getAppRoute } from "@/configs/app-routes";
import { dicebearThumbsAvatarUrl } from "@/lib/avatars/dicebear-thumbs";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "@/lib/user-profile";

const AVATAR_SIZE = 72;

type AccountSettingsValues = {
  name: string;
  preferredCurrency: SupportedCurrency;
};

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AccountSettingsForm() {
  const router = useRouter();
  const { user, isLoading, updateUserProfile } = useUserProfile();
  const exportAccountDataMutation = useMutateExportAccountData();
  const deleteAccountMutation = useMutateDeleteAccount();
  const [submitting, setSubmitting] = React.useState(false);
  const [greeting, setGreeting] = React.useState("Welcome");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountSettingsValues>({
    defaultValues: {
      name: "",
      preferredCurrency: "USD",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      preferredCurrency: user.preferredCurrency,
    });
  }, [reset, user]);

  async function onSubmit(values: AccountSettingsValues) {
    setSubmitting(true);
    try {
      await updateUserProfile(values);
      toast.success("Account settings updated");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not update account settings";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  React.useEffect(() => {
    setGreeting(timeOfDayGreeting());
  }, []);

  async function exportData() {
    try {
      const { blob, filename } = await exportAccountDataMutation.mutateAsync();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success("Data exported");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not export account data";
      toast.error(message);
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "Delete your account permanently? This will remove all your data and cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteAccountMutation.mutateAsync();
      router.push(getAppRoute("home"));
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete account";
      toast.error(message);
    }
  }

  const avatarSeed = user?.email?.trim() || "user";
  const avatarUrl = dicebearThumbsAvatarUrl(avatarSeed, AVATAR_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <section className="rounded-xl border border-border/70 bg-surface-0/60 p-6 text-center shadow-sm">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
          <Image
            src={avatarUrl}
            alt=""
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            className="size-[72px] rounded-full bg-muted object-cover"
            unoptimized
          />
          <p className="text-sm text-subtext-1">{greeting}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {isLoading
              ? "Account settings"
              : (user?.name ?? "Account settings")}
          </h1>
          <p className="text-sm text-subtext-1">
            Update your profile information and preferences.
          </p>
        </div>
      </section>

      <Card className="border-border/80 bg-surface-0/85 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-2 border-b border-border/50 pb-6 text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Profile
          </CardTitle>
          <CardDescription className="leading-relaxed text-subtext-1">
            Your name and preferred currency are used throughout the dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4 pt-6">
            <TextField
              label="Name"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 80,
                  message: "Name must be at most 80 characters",
                },
              })}
            />
            <Controller
              control={control}
              name="preferredCurrency"
              rules={{ required: "Preferred currency is required" }}
              render={({ field }) => (
                <SelectField
                  label="Preferred currency"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={SUPPORTED_CURRENCIES.map((currency) => ({
                    value: currency,
                    label: currency,
                  }))}
                  error={errors.preferredCurrency?.message}
                />
              )}
            />
          </CardContent>
          <CardFooter className="border-t border-border/50 bg-muted/20 pt-6">
            <Button type="submit" disabled={submitting || isLoading}>
              {submitting ? "Saving..." : "Save settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-border/80 bg-surface-0/85 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-2 border-b border-border/50 pb-6 text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Data controls
          </CardTitle>
          <CardDescription className="leading-relaxed text-subtext-1">
            Export your full account data or permanently delete your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void exportData()}
              disabled={
                exportAccountDataMutation.isPending ||
                deleteAccountMutation.isPending
              }
            >
              {exportAccountDataMutation.isPending
                ? "Exporting..."
                : "Export data"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void deleteAccount()}
              disabled={
                deleteAccountMutation.isPending ||
                exportAccountDataMutation.isPending
              }
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Delete account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
