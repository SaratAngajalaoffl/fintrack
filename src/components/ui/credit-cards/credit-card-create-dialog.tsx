"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { useMutateCreateCreditCard } from "@/components/hooks";
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
  TextareaField,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";

const CATEGORY_OPTIONS = [
  { value: "Groceries", label: "Groceries" },
  { value: "Rent", label: "Rent" },
  { value: "Travel", label: "Travel" },
  { value: "Dining", label: "Dining" },
  { value: "Shopping", label: "Shopping" },
  { value: "Utilities", label: "Utilities" },
];

type FormValues = {
  name: string;
  description: string;
  maxBalance: string;
  usedBalance: string;
  lockedBalance: string;
  preferredCategories: string[];
  billGenerationDay: string;
  billDueDay: string;
};

export function CreditCardCreateDialog() {
  const queryClient = useQueryClient();
  const createMutation = useMutateCreateCreditCard();
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
      maxBalance: "0",
      usedBalance: "0",
      lockedBalance: "0",
      preferredCategories: [],
      billGenerationDay: "1",
      billDueDay: "1",
    },
  });

  async function onSubmit(values: FormValues) {
    const maxBalance = Number(values.maxBalance);
    const usedBalance = Number(values.usedBalance);
    const lockedBalance = Number(values.lockedBalance);
    const billGenerationDay = Number(values.billGenerationDay);
    const billDueDay = Number(values.billDueDay);

    if (!Number.isFinite(maxBalance) || maxBalance < 0) {
      toast.error("Max balance must be a valid non-negative number");
      return;
    }
    if (!Number.isFinite(usedBalance) || usedBalance < 0) {
      toast.error("Used balance must be a valid non-negative number");
      return;
    }
    if (!Number.isFinite(lockedBalance) || lockedBalance < 0) {
      toast.error("Locked balance must be a valid non-negative number");
      return;
    }
    if (
      !Number.isInteger(billGenerationDay) ||
      billGenerationDay < 1 ||
      billGenerationDay > 31
    ) {
      toast.error("Bill generation day must be between 1 and 31");
      return;
    }
    if (!Number.isInteger(billDueDay) || billDueDay < 1 || billDueDay > 31) {
      toast.error("Bill due day must be between 1 and 31");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim(),
        maxBalance,
        usedBalance,
        lockedBalance,
        preferredCategories: values.preferredCategories,
        billGenerationDay,
        billDueDay,
      });
      await queryClient.invalidateQueries({
        queryKey: ["credit-cards", "list"],
      });
      toast.success("Credit card created");
      reset();
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create credit card";
      toast.error(message);
    }
  }

  const submitting = isSubmitting || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">Add new card</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add credit card</DialogTitle>
          <DialogDescription>
            Create a credit card with balances, categories, and billing dates.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <TextField
            label="Credit card name"
            required
            error={errors.name?.message}
            placeholder="Atlas Rewards"
            {...register("name", { required: "Credit card name is required" })}
          />

          <TextareaField
            label="Description"
            placeholder="Primary daily-spend rewards card"
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Max balance"
              required
              type="number"
              step="0.01"
              error={errors.maxBalance?.message}
              {...register("maxBalance", {
                required: "Max balance is required",
              })}
            />
            <TextField
              label="Used balance"
              required
              type="number"
              step="0.01"
              error={errors.usedBalance?.message}
              {...register("usedBalance", {
                required: "Used balance is required",
              })}
            />
            <TextField
              label="Locked balance"
              required
              type="number"
              step="0.01"
              error={errors.lockedBalance?.message}
              {...register("lockedBalance", {
                required: "Locked balance is required",
              })}
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
                options={CATEGORY_OPTIONS}
                placeholder="Select preferred categories"
              />
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Bill generation day"
              required
              type="number"
              min={1}
              max={31}
              step="1"
              error={errors.billGenerationDay?.message}
              {...register("billGenerationDay", {
                required: "Bill generation day is required",
              })}
            />
            <TextField
              label="Bill due day"
              required
              type="number"
              min={1}
              max={31}
              step="1"
              error={errors.billDueDay?.message}
              {...register("billDueDay", {
                required: "Bill due day is required",
              })}
            />
          </div>

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
              {submitting ? "Creating..." : "Create card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
