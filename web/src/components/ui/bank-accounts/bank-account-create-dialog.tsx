"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useGetExpenseCategories,
  useMutateCreateBankAccount,
} from "@/components/hooks";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  MultiSelectField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import type { BankAccountType } from "@/lib/bank-accounts/types";

type FormValues = {
  name: string;
  description: string;
  initialBalance: string;
  accountType: BankAccountType;
  preferredCategories: string[];
};

export function BankAccountCreateDialog() {
  const queryClient = useQueryClient();
  const createMutation = useMutateCreateBankAccount();
  const expenseCategoriesQuery = useGetExpenseCategories();
  const [open, setOpen] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      initialBalance: "0",
      accountType: "savings",
      preferredCategories: [],
    },
  });

  async function onSubmit(values: FormValues) {
    const initialBalance = Number(values.initialBalance);
    if (!Number.isFinite(initialBalance)) {
      toast.error("Initial balance must be a valid number");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim(),
        initialBalance,
        accountType: values.accountType,
        preferredCategories: values.preferredCategories,
      });
      await queryClient.invalidateQueries({
        queryKey: ["bank-accounts", "list"],
      });
      toast.success("Bank account created");
      reset();
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create bank account";
      toast.error(message);
    }
  }

  const submitting = isSubmitting || createMutation.isPending;
  const preferredCategoryOptions = React.useMemo(
    () =>
      (expenseCategoriesQuery.data ?? []).map((category) => ({
        value: category.name,
        label: category.name,
      })),
    [expenseCategoriesQuery.data],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">Add new account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add bank account</DialogTitle>
          <DialogDescription>
            Create a bank account with its initial balance and account type.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <TextField
            label="Bank account name"
            required
            error={errors.name?.message}
            placeholder="Primary checking"
            {...register("name", { required: "Bank account name is required" })}
          />

          <TextareaField
            label="Description"
            placeholder="Day-to-day spending and salary deposits"
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Initial balance"
              required
              type="number"
              step="0.01"
              error={errors.initialBalance?.message}
              {...register("initialBalance", {
                required: "Initial balance is required",
              })}
            />

            <Controller
              control={control}
              name="accountType"
              rules={{ required: "Account type is required" }}
              render={({ field }) => (
                <SelectField
                  label="Account type"
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: "savings", label: "Savings" },
                    { value: "current", label: "Current" },
                  ]}
                  error={errors.accountType?.message}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="preferredCategories"
            render={({ field }) => (
              <MultiSelectField
                label="Preferred categories"
                value={field.value}
                onValueChange={field.onChange}
                options={preferredCategoryOptions}
                placeholder={
                  expenseCategoriesQuery.isLoading
                    ? "Loading expense categories..."
                    : preferredCategoryOptions.length > 0
                      ? "Select preferred categories"
                      : "No expense categories available"
                }
                disabled={
                  expenseCategoriesQuery.isLoading ||
                  preferredCategoryOptions.length === 0
                }
              />
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
