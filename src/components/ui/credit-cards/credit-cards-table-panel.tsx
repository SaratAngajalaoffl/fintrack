"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownUp,
  CheckCircle2,
  CircleX,
  Filter,
  Search,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useMutateDeleteCreditCard,
  useMutateUpdateCreditCard,
  useUserProfile,
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
  MultiSelectField,
  TextareaField,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { ChipComponent } from "@/components/ui/common/chip";
import {
  TableComponent,
  type TableToolbarChip,
} from "@/components/ui/common/table-component";
import { getAppRoute } from "@/configs/app-routes";
import {
  creditCardsListHref,
  getBillGenerationInDays,
} from "@/lib/credit-cards/list-state";
import type {
  CreditCardCategory,
  CreditCardRow,
  CreditCardsListState,
} from "@/lib/credit-cards/types";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/formatting/number-formatting";

import { CreditCardsActionMenu } from "./credit-cards-action-menu";

const INPUT_CLASS =
  "h-8 w-full min-w-[12rem] max-w-xs rounded-lg border border-border bg-muted px-2.5 py-1.5 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-0/90 text-foreground shadow-sm transition-colors hover:bg-surface-1";

const CLEAR_LINK =
  "rounded-md p-0.5 text-subtext-0 underline-offset-2 hover:text-foreground hover:underline";

function utilizationPercent(row: CreditCardRow): number {
  if (row.maxBalance <= 0) return 0;
  return (row.usedBalance + row.lockedBalance) / row.maxBalance;
}

function utilizationStatusIcon(utilizationRatio: number) {
  const utilizationPercentValue = utilizationRatio * 100;
  if (utilizationPercentValue <= 25) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            <CheckCircle2 className="size-4 text-emerald-300" aria-hidden />
          </span>
        </TooltipTrigger>
        <TooltipContent>All Good!</TooltipContent>
      </Tooltip>
    );
  }
  if (utilizationPercentValue <= 33) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            <TriangleAlert className="size-4 text-amber-300" aria-hidden />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Your utilisation is getting close to 33%, be careful as it will effect
          your credit score
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          <CircleX className="size-4 text-red-300" aria-hidden />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Your utilisation crossed 33%, pay it before bill generation date to
        protect your credit score
      </TooltipContent>
    </Tooltip>
  );
}

function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(from: Date, to: Date): number {
  const oneDayMs = 1000 * 60 * 60 * 24;
  return Math.round(
    (toStartOfDay(to).getTime() - toStartOfDay(from).getTime()) / oneDayMs,
  );
}

function getBillingTimeline(generationDay: number, dueDay: number, now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const hasGeneratedThisCycle = today >= generationDay;

  const generationDate = hasGeneratedThisCycle
    ? new Date(year, month, generationDay)
    : new Date(year, month - 1, generationDay);
  const dueDate = hasGeneratedThisCycle
    ? new Date(year, month + (dueDay >= generationDay ? 0 : 1), dueDay)
    : new Date(year, month + (dueDay >= generationDay ? -1 : 0), dueDay);
  const nextGenerationDate = hasGeneratedThisCycle
    ? new Date(year, month + 1, generationDay)
    : new Date(year, month, generationDay);

  return { generationDate, dueDate, nextGenerationDate, hasGeneratedThisCycle };
}

function formatBillGenerationLabel(
  generationDay: number,
  dueDay: number,
): string {
  const now = new Date();
  const timeline = getBillingTimeline(generationDay, dueDay, now);

  if (timeline.hasGeneratedThisCycle) {
    const daysSinceGeneration = dayDiff(timeline.generationDate, now);
    return `Generated ${formatNumber(daysSinceGeneration, "en-US", {
      maximumFractionDigits: 0,
    })} days ago`;
  }

  const daysUntilGeneration = dayDiff(now, timeline.nextGenerationDate);
  return `In ${formatNumber(daysUntilGeneration, "en-US", {
    maximumFractionDigits: 0,
  })} days`;
}

function formatLastBillGeneratedLabel(row: CreditCardRow): string {
  if (!row.latestBill) return "No bills yet";

  const now = new Date();
  const generatedAt = new Date(row.latestBill.billGenerationDate);
  const daysAgo = Math.max(0, dayDiff(generatedAt, now));

  return `${formatNumber(daysAgo, "en-US", {
    maximumFractionDigits: 0,
  })} days ago`;
}

function getLastBillDueMeta(row: CreditCardRow): {
  label: string;
  tone: "muted" | "success" | "warning" | "danger";
} {
  if (!row.latestBill) {
    return { label: "No bills yet", tone: "muted" };
  }

  if (row.latestBill.isBillPaid) {
    if (row.latestBill.billPaymentDate) {
      const paidAt = new Date(row.latestBill.billPaymentDate);
      const now = new Date();
      const daysAgo = Math.max(0, dayDiff(paidAt, now));
      return { label: `Paid ${daysAgo} days ago`, tone: "success" };
    }
    return { label: "Paid", tone: "success" };
  }

  const dueAt = new Date(row.latestBill.billDueDate);
  const now = new Date();
  const daysUntilDue = dayDiff(now, dueAt);
  if (daysUntilDue >= 0) {
    return {
      label: `Due in ${formatNumber(daysUntilDue, "en-US", {
        maximumFractionDigits: 0,
      })} days`,
      tone: "warning",
    };
  }

  return {
    label: `Overdue by ${formatNumber(Math.abs(daysUntilDue), "en-US", {
      maximumFractionDigits: 0,
    })} days`,
    tone: "danger",
  };
}

function sortDescription(sort: string): string {
  switch (sort) {
    case "-name":
      return "Sort: Name (Z-A)";
    case "max":
      return "Sort: Max balance (low to high)";
    case "-max":
      return "Sort: Max balance (high to low)";
    case "used":
      return "Sort: Used balance (low to high)";
    case "-used":
      return "Sort: Used balance (high to low)";
    case "locked":
      return "Sort: Locked balance (low to high)";
    case "-locked":
      return "Sort: Locked balance (high to low)";
    case "utilization":
      return "Sort: Utilisation (low to high)";
    case "-utilization":
      return "Sort: Utilisation (high to low)";
    case "billGenerationIn":
      return "Sort: Bill generation in (soonest first)";
    case "-billGenerationIn":
      return "Sort: Bill generation in (latest first)";
    case "name":
    default:
      return "Sort: Name (A-Z)";
  }
}

function buildActiveToolbarChips(
  base: CreditCardsListState,
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
              href={creditCardsListHref(base, { q: "" })}
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

  if (base.category !== "all") {
    chips.push({
      id: "category",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={creditCardsListHref(base, { category: "all" })}
              aria-label="Clear preferred category filter"
            >
              x
            </Link>
          }
        >
          <span className="text-foreground">Category:</span> {base.category}
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
              href={creditCardsListHref(base, { sort: "name" })}
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

function FilterMenu({
  base,
  categories,
}: {
  base: CreditCardsListState;
  categories: CreditCardCategory[];
}) {
  return (
    <CreditCardsActionMenu
      triggerLabel="Filter by preferred category"
      triggerIcon={<Filter className="size-4" aria-hidden />}
      panelClassName="max-h-72 min-w-48 overflow-y-auto"
    >
      <div>
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">
          Preferred category
        </p>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={creditCardsListHref(base, { category: "all" })}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
            href={creditCardsListHref(base, { category })}
          >
            {category}
          </Link>
        ))}
      </div>
    </CreditCardsActionMenu>
  );
}

function SortMenu({ base }: { base: CreditCardsListState }) {
  const items: { label: string; sort: string }[] = [
    { label: "Name (A-Z)", sort: "name" },
    { label: "Name (Z-A)", sort: "-name" },
    { label: "Max balance (low to high)", sort: "max" },
    { label: "Max balance (high to low)", sort: "-max" },
    { label: "Used balance (low to high)", sort: "used" },
    { label: "Used balance (high to low)", sort: "-used" },
    { label: "Locked balance (low to high)", sort: "locked" },
    { label: "Locked balance (high to low)", sort: "-locked" },
    { label: "Utilisation (low to high)", sort: "utilization" },
    { label: "Utilisation (high to low)", sort: "-utilization" },
    { label: "Bill generation in (soonest first)", sort: "billGenerationIn" },
    { label: "Bill generation in (latest first)", sort: "-billGenerationIn" },
  ];

  return (
    <CreditCardsActionMenu
      triggerLabel="Choose sort order"
      triggerIcon={<ArrowDownUp className="size-4" aria-hidden />}
      panelClassName="max-h-72 min-w-64 overflow-y-auto"
    >
      <div>
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">
          Sort by
        </p>
        {items.map(({ label, sort }) => (
          <Link
            key={sort}
            className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
            href={creditCardsListHref(base, { sort })}
          >
            {label}
          </Link>
        ))}
      </div>
    </CreditCardsActionMenu>
  );
}

function SearchForm({ base }: { base: CreditCardsListState }) {
  const preserved: { name: string; value: string }[] = [];
  if (base.category !== "all") {
    preserved.push({ name: "category", value: base.category });
  }
  if (base.sort && base.sort !== "name") {
    preserved.push({ name: "sort", value: base.sort });
  }

  return (
    <form
      method="get"
      action={getAppRoute("dashboardCreditCards")}
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
        placeholder="Search credit cards..."
        className={INPUT_CLASS}
        aria-label="Search credit cards"
        autoComplete="off"
      />
      <button type="submit" className={ICON_BTN} aria-label="Apply search">
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  );
}

type CreditCardEditFormValues = {
  name: string;
  description: string;
  maxBalance: string;
  usedBalance: string;
  lockedBalance: string;
  preferredCategories: string[];
  billGenerationDay: string;
  billDueDay: string;
};

function CreditCardEditDialog({
  row,
  availableCategories,
}: {
  row: CreditCardRow;
  availableCategories: CreditCardCategory[];
}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutateUpdateCreditCard();
  const [open, setOpen] = React.useState(false);
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreditCardEditFormValues>({
    defaultValues: {
      name: row.name,
      description: row.description,
      maxBalance: row.maxBalance.toString(),
      usedBalance: row.usedBalance.toString(),
      lockedBalance: row.lockedBalance.toString(),
      preferredCategories: row.preferredCategories,
      billGenerationDay: row.billGenerationDay.toString(),
      billDueDay: row.billDueDay.toString(),
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: row.name,
        description: row.description,
        maxBalance: row.maxBalance.toString(),
        usedBalance: row.usedBalance.toString(),
        lockedBalance: row.lockedBalance.toString(),
        preferredCategories: row.preferredCategories,
        billGenerationDay: row.billGenerationDay.toString(),
        billDueDay: row.billDueDay.toString(),
      });
    }
  }, [open, reset, row]);

  async function onSubmit(values: CreditCardEditFormValues) {
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
      await updateMutation.mutateAsync({
        cardId: row.id,
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
      toast.success("Credit card updated");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update credit card",
      );
    }
  }

  const submitting = isSubmitting || updateMutation.isPending;
  const preferredCategoryOptions = availableCategories.map((category) => ({
    value: category,
    label: category,
  }));

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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit credit card</DialogTitle>
          <DialogDescription>
            Update balances, preferred categories, and billing dates.
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
            {...register("name", { required: "Credit card name is required" })}
          />
          <TextareaField
            label="Description"
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
                options={preferredCategoryOptions}
                placeholder={
                  preferredCategoryOptions.length > 0
                    ? "Select preferred categories"
                    : "No expense categories available"
                }
                disabled={preferredCategoryOptions.length === 0}
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

function CreditCardDeleteDialog({ row }: { row: CreditCardRow }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutateDeleteCreditCard();
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(row.id);
      await queryClient.invalidateQueries({
        queryKey: ["credit-cards", "list"],
      });
      toast.success("Credit card deleted");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete credit card",
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
          <DialogTitle>Delete credit card?</DialogTitle>
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

type CreditCardsTablePanelProps = {
  listState: CreditCardsListState;
  rows: CreditCardRow[];
  availableCategories: CreditCardCategory[];
};

export function CreditCardsTablePanel({
  listState,
  rows,
  availableCategories,
}: CreditCardsTablePanelProps) {
  const { user } = useUserProfile();
  const preferredCurrency = user?.preferredCurrency ?? "USD";
  const activeChips = buildActiveToolbarChips(listState);

  return (
    <TableComponent
      title="Credit cards"
      activeChips={activeChips}
      filterSlot={
        <FilterMenu base={listState} categories={availableCategories} />
      }
      sortSlot={<SortMenu base={listState} />}
      searchSlot={<SearchForm base={listState} />}
    >
      <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-mantle/90 text-subtext-1">
            <th scope="col" className="px-4 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Description
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Max balance
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Used balance
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Locked balance
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Utilisation
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Preferred categories
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Last bill generated
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Last bill due
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Next bill generation
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="text-foreground">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-10 text-center text-subtext-1"
              >
                No credit cards match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const billGenerationIn = getBillGenerationInDays(
                row.billGenerationDay,
              );
              const nextBillGenerationLabel = formatBillGenerationLabel(
                row.billGenerationDay,
                row.billDueDay,
              );
              const lastBillDueMeta = getLastBillDueMeta(row);
              const utilization = utilizationPercent(row);

              return (
                <tr
                  key={row.id}
                  className="border-b border-border/40 transition-colors hover:bg-surface-1/40"
                >
                  <td className="max-w-40 px-4 py-3 font-medium">{row.name}</td>
                  <td className="max-w-xs px-4 py-3 text-subtext-1">
                    {row.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(row.maxBalance, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(row.usedBalance, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(row.lockedBalance, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex w-full items-center justify-end gap-1.5">
                      {utilizationStatusIcon(utilization)}
                      {formatNumber(utilization, "en-US", {
                        style: "percent",
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-64 flex-wrap gap-1.5">
                      {row.preferredCategories.map((category) => (
                        <ChipComponent
                          key={category}
                          variant="filled"
                          className="max-w-full"
                        >
                          {category}
                        </ChipComponent>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    <span>{formatLastBillGeneratedLabel(row)}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={
                        lastBillDueMeta.tone === "success"
                          ? "inline-flex items-center gap-1.5 text-emerald-300"
                          : lastBillDueMeta.tone === "warning"
                            ? "inline-flex items-center gap-1.5 text-amber-300"
                            : lastBillDueMeta.tone === "danger"
                              ? "inline-flex items-center gap-1.5 text-red-300"
                              : "inline-flex items-center gap-1.5 text-subtext-1"
                      }
                    >
                      {lastBillDueMeta.tone === "success" ? (
                        <CheckCircle2 className="size-4" aria-hidden />
                      ) : lastBillDueMeta.tone === "warning" ? (
                        <TriangleAlert className="size-4" aria-hidden />
                      ) : lastBillDueMeta.tone === "danger" ? (
                        <CircleX className="size-4" aria-hidden />
                      ) : null}
                      {lastBillDueMeta.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      title={`${billGenerationIn} days until next generation`}
                    >
                      {nextBillGenerationLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <CreditCardEditDialog
                        row={row}
                        availableCategories={availableCategories}
                      />
                      <CreditCardDeleteDialog row={row} />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </TableComponent>
  );
}
