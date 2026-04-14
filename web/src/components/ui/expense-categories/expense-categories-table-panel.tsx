"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownUp, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useMutateDeleteExpenseCategory,
  useMutateUpdateExpenseCategory,
} from "@/components/hooks";
import { toast } from "@/components/ui/common/toast";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/icon-picker";
import { IconPicker } from "@/components/ui/icon-picker";
import {
  TableComponent,
  type TableToolbarChip,
} from "@/components/ui/common/table-component";
import { getAppRoute } from "@/configs/app-routes";
import { expenseCategoriesListHref } from "@/lib/expense-categories/list-state";
import type {
  CatppuccinMochaColor,
  ExpenseCategoriesListState,
  ExpenseCategoryRow,
} from "@/lib/expense-categories/types";
import { ChipComponent } from "@/components/ui/common/chip";

const INPUT_CLASS =
  "h-8 w-full min-w-[12rem] max-w-xs rounded-lg border border-border bg-muted px-2.5 py-1.5 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-0/90 text-foreground shadow-sm transition-colors hover:bg-surface-1";

const CLEAR_LINK =
  "rounded-md p-0.5 text-subtext-0 underline-offset-2 hover:text-foreground hover:underline";

const COLOR_HEX_BY_TOKEN: Record<CatppuccinMochaColor, string> = {
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

function sortDescription(sort: string): string {
  switch (sort) {
    case "-name":
      return "Sort: Name (Z-A)";
    case "color":
      return "Sort: Color (A-Z)";
    case "-color":
      return "Sort: Color (Z-A)";
    case "name":
    default:
      return "Sort: Name (A-Z)";
  }
}

function buildActiveToolbarChips(
  base: ExpenseCategoriesListState,
): TableToolbarChip[] {
  const chips: TableToolbarChip[] = [];

  if (base.q) {
    chips.push({
      id: "q",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={expenseCategoriesListHref(base, { q: "" })}
              aria-label="Clear search"
            >
              x
            </Link>
          }
        >
          <span className="text-foreground">Search:</span>{" "}
          <span className="font-normal text-subtext-1">
            &ldquo;{base.q}&rdquo;
          </span>
        </ChipComponent>
      ),
    });
  }

  if (base.sort && base.sort !== "name") {
    chips.push({
      id: "sort",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={expenseCategoriesListHref(base, { sort: "name" })}
              aria-label="Reset sort to name"
            >
              x
            </Link>
          }
        >
          {sortDescription(base.sort)}
        </ChipComponent>
      ),
    });
  }

  return chips;
}

function SortMenu({ base }: { base: ExpenseCategoriesListState }) {
  const items: { label: string; sort: string }[] = [
    { label: "Name (A-Z)", sort: "name" },
    { label: "Name (Z-A)", sort: "-name" },
    { label: "Color (A-Z)", sort: "color" },
    { label: "Color (Z-A)", sort: "-color" },
  ];

  return (
    <details className="relative">
      <summary className={ICON_BTN}>
        <ArrowDownUp className="size-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-30 mt-1 max-h-72 min-w-56 overflow-y-auto rounded-xl border border-border/80 bg-surface-0 py-1 shadow-lg">
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">
          Sort by
        </p>
        {items.map(({ label, sort }) => (
          <Link
            key={sort}
            className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
            href={expenseCategoriesListHref(base, { sort })}
          >
            {label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function SearchForm({ base }: { base: ExpenseCategoriesListState }) {
  const preserved: { name: string; value: string }[] = [];
  if (base.sort && base.sort !== "name") {
    preserved.push({ name: "sort", value: base.sort });
  }

  return (
    <form
      method="get"
      action={getAppRoute("dashboardExpenseCategories")}
      className="flex max-w-full items-center gap-1.5"
      role="search"
    >
      {preserved.map((field) => (
        <input
          key={field.name}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}
      <input
        type="search"
        name="q"
        defaultValue={base.q}
        placeholder="Search categories..."
        className={INPUT_CLASS}
        aria-label="Search expense categories"
        autoComplete="off"
      />
      <button type="submit" className={ICON_BTN} aria-label="Apply search">
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  );
}

type ExpenseCategoryEditFormValues = {
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

function ExpenseCategoryEditDialog({ row }: { row: ExpenseCategoryRow }) {
  const queryClient = useQueryClient();
  const updateMutation = useMutateUpdateExpenseCategory();
  const [open, setOpen] = React.useState(false);
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseCategoryEditFormValues>({
    defaultValues: {
      name: row.name,
      description: row.description,
      iconUrl: row.iconUrl as IconName,
      color: row.color,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: row.name,
        description: row.description,
        iconUrl: row.iconUrl as IconName,
        color: row.color,
      });
    }
  }, [open, reset, row]);

  async function onSubmit(values: ExpenseCategoryEditFormValues) {
    try {
      await updateMutation.mutateAsync({
        categoryId: row.id,
        name: values.name.trim(),
        description: values.description.trim(),
        iconUrl: values.iconUrl.trim(),
        color: values.color,
      });
      await queryClient.invalidateQueries({
        queryKey: ["expense-categories", "list"],
      });
      toast.success("Expense category updated");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update expense category",
      );
    }
  }

  const submitting = isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit expense category</DialogTitle>
          <DialogDescription>
            Update category name, icon, color, and description.
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
            {...register("name", { required: "Category name is required" })}
          />
          <TextareaField
            label="Description"
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
                  options={Object.keys(COLOR_HEX_BY_TOKEN).map((color) => ({
                    value: color,
                    label: (
                      <span
                        className="inline-flex items-center"
                        aria-label={color}
                      >
                        <span
                          className="inline-block h-2 w-20 rounded-sm border border-border/60"
                          style={{
                            backgroundColor:
                              COLOR_HEX_BY_TOKEN[color as CatppuccinMochaColor],
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseCategoryDeleteDialog({ row }: { row: ExpenseCategoryRow }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutateDeleteExpenseCategory();
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(row.id);
      await queryClient.invalidateQueries({
        queryKey: ["expense-categories", "list"],
      });
      toast.success("Expense category deleted");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete expense category",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs text-destructive"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete expense category?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-medium text-foreground">{row.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type ExpenseCategoriesTablePanelProps = {
  listState: ExpenseCategoriesListState;
  rows: ExpenseCategoryRow[];
};

export function ExpenseCategoriesTablePanel({
  listState,
  rows,
}: ExpenseCategoriesTablePanelProps) {
  const activeChips = buildActiveToolbarChips(listState);

  return (
    <TableComponent
      title="Expense categories"
      activeChips={activeChips}
      sortSlot={<SortMenu base={listState} />}
      searchSlot={<SearchForm base={listState} />}
    >
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-mantle/90 text-subtext-1">
            <th scope="col" className="px-4 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Description
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Icon
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Color
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="text-foreground">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-subtext-1">
                No expense categories match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-surface-1/40"
              >
                <td className="max-w-40 px-4 py-3 font-medium">{row.name}</td>
                <td className="max-w-sm px-4 py-3 text-subtext-1">
                  {row.description}
                </td>
                <td className="max-w-xs px-4 py-3 text-subtext-1">
                  <Icon name={row.iconUrl as IconName} className="size-4" />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className="inline-flex items-center"
                    aria-label={row.color}
                  >
                    <span
                      className="inline-block h-2 w-20 rounded-sm border border-border/60"
                      style={{ backgroundColor: COLOR_HEX_BY_TOKEN[row.color] }}
                      aria-hidden
                    />
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <ExpenseCategoryEditDialog row={row} />
                    <ExpenseCategoryDeleteDialog row={row} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableComponent>
  );
}
