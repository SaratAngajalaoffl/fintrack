"use client";

import { useQueryClient } from "@tanstack/react-query";
import { icons, type LucideIcon } from "lucide-react";
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
  SelectField,
  TextareaField,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import {
  CATPPUCCIN_MOCHA_COLOR_OPTIONS,
  type CatppuccinMochaColor,
} from "@/lib/expense-categories/types";

const COLOR_VAR_BY_TOKEN: Record<CatppuccinMochaColor, string> = {
  text: "--text",
  "subtext-1": "--subtext-1",
  "subtext-0": "--subtext-0",
  "overlay-2": "--overlay-2",
  "overlay-1": "--overlay-1",
  "overlay-0": "--overlay-0",
  "surface-2": "--surface-2",
  "surface-1": "--surface-1",
  "surface-0": "--surface-0",
  base: "--base",
  mantle: "--mantle",
  crust: "--crust",
  red: "--red",
  mauve: "--mauve",
};

type FormValues = {
  name: string;
  description: string;
  iconUrl: string;
  color: CatppuccinMochaColor;
};

const ICON_NAMES = Object.keys(icons).sort() as Array<keyof typeof icons>;
const DEFAULT_ICON_NAME = ICON_NAMES.includes("CircleHelp")
  ? "CircleHelp"
  : ICON_NAMES[0];

const ICON_OPTIONS: { value: string; label: React.ReactNode }[] =
  ICON_NAMES.map((iconName) => {
    const Icon = icons[iconName] as LucideIcon;
    return {
      value: iconName,
      label: (
        <span className="inline-flex items-center" aria-label={iconName}>
          <Icon className="size-4" aria-hidden />
        </span>
      ),
    };
  });

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
      iconUrl: DEFAULT_ICON_NAME,
      color: "surface-0",
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
                <SelectField
                  label="Category icon"
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                  options={ICON_OPTIONS}
                  error={errors.iconUrl?.message}
                />
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
                            backgroundColor: `var(${COLOR_VAR_BY_TOKEN[color]})`,
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
