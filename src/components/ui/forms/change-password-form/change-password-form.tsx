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

type FormValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordForm() {
  const [otpToken, setOtpToken] = React.useState<string | null>(null);
  const [requestError, setRequestError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function requestCode() {
    setRequestError(null);
    setSuccess(null);
    const res = await fetch("/api/auth/change-password/request-otp", {
      method: "POST",
      credentials: "include",
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      otpToken?: string;
    };
    if (!res.ok) {
      setRequestError(body.error ?? "Could not send verification code");
      return;
    }
    if (!body.otpToken) {
      setRequestError("Could not start verification. Try again.");
      return;
    }
    setOtpToken(body.otpToken);
    reset({ otp: "", newPassword: "", confirmPassword: "" });
  }

  async function onSubmit(data: FormValues) {
    if (!otpToken) {
      setError("root", { message: "Send a verification code first." });
      return;
    }
    clearErrors("root");
    setSuccess(null);
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
      setError("root", {
        message: body.error ?? "Could not change password",
      });
      return;
    }
    setSuccess(body.message ?? "Password changed.");
    setOtpToken(null);
    const current = getValues();
    reset({ ...current, otp: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Change password
        </CardTitle>
        <CardDescription>
          {otpToken
            ? "Enter the verification code and your new password."
            : "Send a verification code to your session, then enter the code here. In development, the code is printed in the server log."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {!otpToken ? (
            <>
              {requestError ? (
                <p className="text-sm text-destructive" role="alert">
                  {requestError}
                </p>
              ) : null}
              <Button
                type="button"
                className="w-full sm:w-auto"
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
                  setRequestError(null);
                  reset();
                }}
              >
                Use a different code
              </Button>
            </>
          )}
          {errors.root?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-subtext-1" role="status">
              {success}
            </p>
          ) : null}
        </CardContent>
        {otpToken ? (
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
            <Button variant="ghost" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </CardFooter>
        ) : (
          <CardFooter>
            <Button variant="ghost" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
