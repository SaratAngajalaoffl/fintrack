"use client";

import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useMutateResetPassword } from "@/components/hooks";
import { PasswordResetOtpField } from "@/components/ui/forms/password-reset-otp-field";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import { getAppRoute } from "@/configs/app-routes";
import { PASSWORD_RESET_SESSION_KEY } from "@/lib/auth/password-reset-session";

type ResetValues = {
  email: string;
  otp: string;
  otpToken: string;
  newPassword: string;
  confirmPassword: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const resetPasswordMutation = useMutateResetPassword();
  const [sessionStatus, setSessionStatus] = React.useState<
    "loading" | "ready" | "missing"
  >("loading");

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ResetValues>({
    defaultValues: {
      email: "",
      otp: "",
      otpToken: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PASSWORD_RESET_SESSION_KEY);
      if (!raw) {
        setSessionStatus("missing");
        return;
      }
      const parsed = JSON.parse(raw) as {
        otpToken?: string;
        email?: string;
      };
      if (!parsed.otpToken || !parsed.email) {
        setSessionStatus("missing");
        return;
      }
      reset({
        email: parsed.email,
        otpToken: parsed.otpToken,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSessionStatus("ready");
    } catch {
      setSessionStatus("missing");
    }
  }, [reset]);

  async function onSubmit(data: ResetValues) {
    clearErrors("root");
    let body: { message?: string } | undefined;
    try {
      body = await resetPasswordMutation.mutateAsync({
        email: data.email,
        otp: data.otp,
        otpToken: data.otpToken,
        newPassword: data.newPassword,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not reset password";
      toast.error(message);
      return;
    }
    try {
      sessionStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
    } catch {
      /* ignore */
    }
    toast.success("Password updated", {
      description: body.message ?? "You can sign in with your new password.",
      action: {
        label: "Go to log in",
        onClick: () => router.push(getAppRoute("login")),
      },
    });
    const current = getValues();
    reset({
      ...current,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    router.refresh();
  }

  if (sessionStatus === "loading") {
    return (
      <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
        <CardContent className="py-10 text-center text-sm text-subtext-1">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (sessionStatus === "missing") {
    return (
      <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Reset password
          </CardTitle>
          <CardDescription>
            Start from forgot password so we can verify your email. This page
            opens automatically after you continue from there.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="w-full sm:w-auto" asChild>
            <Link href={getAppRoute("forgotPassword")}>Forgot password</Link>
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href={getAppRoute("login")}>Back to log in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Reset password
        </CardTitle>
        <CardDescription>
          Enter the verification code and choose a new password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register("email")} />
        <input type="hidden" {...register("otpToken")} />
        <CardContent className="space-y-4">
          <Controller
            name="otp"
            control={control}
            rules={{
              required: "Verification code is required",
              validate: (v) => /^\d{6}$/.test(v) || "Enter the 6-digit code",
            }}
            render={({ field }) => (
              <PasswordResetOtpField
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                error={errors.otp?.message}
              />
            )}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Confirm your password",
              validate: (v, form) =>
                v === form.newPassword || "Passwords do not match",
            })}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || resetPasswordMutation.isPending}
          >
            {isSubmitting || resetPasswordMutation.isPending
              ? "Updating…"
              : "Update password"}
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href={getAppRoute("login")}>Back to log in</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
