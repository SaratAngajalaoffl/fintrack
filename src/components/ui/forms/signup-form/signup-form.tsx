"use client";

import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";

import { useMutateSignup } from "@/components/hooks";
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

type SignupValues = {
  email: string;
  password: string;
};

export function SignupForm() {
  const signupMutation = useMutateSignup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<SignupValues>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: SignupValues) {
    clearErrors("root");
    let body: { message?: string } | undefined;
    try {
      body = await signupMutation.mutateAsync(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create account";
      toast.error(message);
      return;
    }
    reset();
    toast.success("Account created", {
      description:
        body.message ??
        "An administrator must approve your account before you can sign in.",
    });
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Choose an email and a password (at least 8 characters).
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || signupMutation.isPending}
          >
            {isSubmitting || signupMutation.isPending
              ? "Creating account…"
              : "Sign up"}
          </Button>
          <p className="text-center text-sm text-subtext-1 sm:text-right">
            Already have an account?{" "}
            <Link
              href={getAppRoute("login")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
