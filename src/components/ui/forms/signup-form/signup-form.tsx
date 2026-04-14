"use client";

import Link from "next/link";
import * as React from "react";
import { Controller } from "react-hook-form";
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
  SelectField,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import { getAppRoute } from "@/configs/app-routes";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "@/lib/user-profile";

type SignupValues = {
  name: string;
  email: string;
  password: string;
  preferredCurrency: SupportedCurrency;
};

export function SignupForm() {
  const signupMutation = useMutateSignup();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<SignupValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      preferredCurrency: "USD",
    },
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
          Add your profile details to personalize your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
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
            })}
          />
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
