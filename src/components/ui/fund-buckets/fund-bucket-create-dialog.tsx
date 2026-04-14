"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useGetBankAccounts,
  useMutateCreateFundBucket,
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
  SelectField,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import type { FundBucketPriority } from "@/lib/fund-buckets/types";

type FormValues = {
  name: string;
  targetAmount: string;
  bankAccountId: string;
  priority: FundBucketPriority;
};

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export function FundBucketCreateDialog() {
  const queryClient = useQueryClient();
  const createMutation = useMutateCreateFundBucket();
  const bankAccountsQuery = useGetBankAccounts();
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
      targetAmount: "",
      bankAccountId: "",
      priority: "medium",
    },
  });

  async function onSubmit(values: FormValues) {
    const targetAmount = Number(values.targetAmount);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      toast.error("Target amount must be a valid number greater than 0");
      return;
    }

    if (!values.bankAccountId) {
      toast.error("Please select a bank account");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        targetAmount,
        bankAccountId: values.bankAccountId,
        priority: values.priority,
      });
      await queryClient.invalidateQueries({
        queryKey: ["fund-buckets", "list"],
      });
      toast.success("Fund bucket created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create fund bucket",
      );
    }
  }

  const accountOptions = React.useMemo(
    () =>
      (bankAccountsQuery.data ?? []).map((account) => ({
        value: account.id,
        label: account.name,
      })),
    [bankAccountsQuery.data],
  );

  const submitting = isSubmitting || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">Add fund bucket</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add fund bucket</DialogTitle>
          <DialogDescription>
            Create a virtual bucket and lock allocations until the target is
            met.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <TextField
            label="Bucket name"
            required
            error={errors.name?.message}
            placeholder="Emergency Fund"
            {...register("name", { required: "Bucket name is required" })}
          />
          <TextField
            label="Target amount"
            required
            type="number"
            min={0}
            step="0.01"
            placeholder="5000"
            error={errors.targetAmount?.message}
            {...register("targetAmount", {
              required: "Target amount is required",
            })}
          />
          <Controller
            control={control}
            name="bankAccountId"
            rules={{ required: "Bank account is required" }}
            render={({ field }) => (
              <SelectField
                label="Bank account"
                required
                value={field.value}
                onValueChange={field.onChange}
                options={accountOptions}
                placeholder={
                  bankAccountsQuery.isLoading
                    ? "Loading bank accounts..."
                    : "Select bank account"
                }
                disabled={
                  bankAccountsQuery.isLoading || accountOptions.length === 0
                }
                error={errors.bankAccountId?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <SelectField
                label="Priority"
                required
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value as FundBucketPriority)
                }
                options={PRIORITY_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
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
              {submitting ? "Creating..." : "Create bucket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
