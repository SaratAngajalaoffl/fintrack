"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { useMutateCreateExpenseCategory } from "@/components/hooks";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/ui";
import { Icon, IconPicker, type IconName } from "@/components/ui/icon-picker";
import { toast } from "@/components/ui/common/toast";
import {
  CATPPUCCIN_MOCHA_COLOR_OPTIONS,
  type CatppuccinMochaColor,
} from "@/lib/expense-categories/types";

const COLOR_VAR_BY_TOKEN: Record<CatppuccinMochaColor, string> = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
};

type FormValues = {
  name: string;
  description: string;
  iconUrl: IconName;
  color: CatppuccinMochaColor;
};

function formatIconName(name: IconName): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ExpenseCategoryCreateDialog() {
  const queryClient = useQueryClient();
  const createMutation = useMutateCreateExpenseCategory();
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
      iconUrl: "circle-help",
      color: "mauve",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim(),
        iconUrl: values.iconUrl.trim(),
        color: values.color,
      });
      await queryClient.invalidateQueries({
        queryKey: ["expense-categories", "list"],
      });
      toast.success("Expense category created");
      reset();
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create expense category";
      toast.error(message);
    }
  }

  const submitting = isSubmitting || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">Add new category</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add expense category</DialogTitle>
          <DialogDescription>
            Create a category with a Lucide icon and Catppuccin color.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <TextField
            label="Category name"
            required
            error={errors.name?.message}
            placeholder="Groceries"
            {...register("name", { required: "Category name is required" })}
          />
          <TextareaField
            label="Description"
            placeholder="Recurring supermarket and essentials spends"
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="iconUrl"
              rules={{ required: "Category icon is required" }}
              render={({ field }) => (
                <Field
                  label="Category icon"
                  required
                  error={errors.iconUrl?.message}
                >
                  <IconPicker
                    value={field.value}
                    onValueChange={field.onChange}
                    triggerPlaceholder="Select icon"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full justify-start gap-2"
                    >
                      <Icon name={field.value} className="size-4" />
                      <span className="truncate text-sm">
                        {formatIconName(field.value)}
                      </span>
                    </Button>
                  </IconPicker>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="color"
              rules={{ required: "Category color is required" }}
              render={({ field }) => (
                <SelectField
                  label="Category color"
                  required
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as CatppuccinMochaColor)
                  }
                  options={CATPPUCCIN_MOCHA_COLOR_OPTIONS.map((color) => ({
                    value: color,
                    label: (
                      <span
                        className="inline-flex items-center"
                        aria-label={color}
                      >
                        <span
                          className="inline-block h-2 w-20 rounded-sm border border-border/60"
                          style={{
                            backgroundColor: COLOR_VAR_BY_TOKEN[color],
                          }}
                          aria-hidden
                        />
                      </span>
                    ),
                  }))}
                  error={errors.color?.message}
                />
              )}
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
              {submitting ? "Creating..." : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
