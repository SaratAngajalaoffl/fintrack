"use client";

import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

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

type FormValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordForm() {
  const [otpToken, setOtpToken] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function requestCode() {
    const res = await fetch("/api/auth/change-password/request-otp", {
      method: "POST",
      credentials: "include",
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      otpToken?: string;
    };
    if (!res.ok) {
      toast.error(body.error ?? "Could not send verification code");
      return;
    }
    if (!body.otpToken) {
      toast.error("Could not start verification. Try again.");
      return;
    }
    toast.success("Verification code sent", {
      description: "In development, the code is printed in the server log.",
    });
    setOtpToken(body.otpToken);
    reset({ otp: "", newPassword: "", confirmPassword: "" });
  }

  async function onSubmit(data: FormValues) {
    if (!otpToken) {
      toast.error("Send a verification code first.");
      return;
    }
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        otp: data.otp,
        otpToken,
        newPassword: data.newPassword,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      toast.error(body.error ?? "Could not change password");
      return;
    }
    toast.success(body.message ?? "Password changed.");
    setOtpToken(null);
    const current = getValues();
    reset({ ...current, otp: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <Card className="border-border/80 bg-surface-0/85 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-2 border-b border-border/50 pb-6 text-left">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Change password
        </CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          {otpToken
            ? "Enter the verification code and your new password."
            : "Send a verification code to your session, then enter the code here. In development, the code is printed in the server log."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4 pt-6">
          {!otpToken ? (
            <>
              <Button
                type="button"
                className="w-full"
                onClick={() => void requestCode()}
              >
                Send verification code
              </Button>
            </>
          ) : (
            <>
              <Controller
                name="otp"
                control={control}
                rules={{
                  required: "Verification code is required",
                  validate: (v) =>
                    /^\d{6}$/.test(v) || "Enter the 6-digit code",
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-0 text-subtext-1"
                onClick={() => {
                  setOtpToken(null);
                  reset();
                }}
              >
                Use a different code
              </Button>
            </>
          )}
        </CardContent>
        {otpToken ? (
          <CardFooter className="flex flex-col-reverse gap-3 border-t border-border/50 bg-muted/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button
              type="submit"
              className="w-full sm:min-w-[10rem] sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="flex flex-col gap-1 border-t border-border/50 bg-muted/20 pt-6">
            <Button
              variant="ghost"
              className="h-auto justify-start px-0 py-2 text-subtext-1 hover:text-foreground"
              asChild
            >
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
