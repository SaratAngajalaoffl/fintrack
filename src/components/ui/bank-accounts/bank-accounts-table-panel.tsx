"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownUp, Filter, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useMutateDeleteBankAccount,
  useMutateUpdateBankAccount,
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
  SelectField,
  TextareaField,
  TextField,
} from "@/components/ui";
import { ChipComponent } from "@/components/ui/common/chip";
import {
  TableComponent,
  type TableToolbarChip,
} from "@/components/ui/common/table-component";
import { getAppRoute } from "@/configs/app-routes";
import type {
  BankAccountRow,
  BankAccountsListState,
} from "@/lib/bank-accounts/types";
import { bankAccountsListHref } from "@/lib/bank-accounts/list-state";
import { formatCurrency } from "@/lib/formatting/number-formatting";
import { BankAccountsActionMenu } from "@/components/ui/bank-accounts/bank-accounts-action-menu";

const INPUT_CLASS =
  "h-8 w-full min-w-[12rem] max-w-xs rounded-lg border border-border bg-muted px-2.5 py-1.5 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-0/90 text-foreground shadow-sm transition-colors hover:bg-surface-1";

function accountTypeLabel(type: BankAccountRow["accountType"]): string {
  return type === "savings" ? "Savings" : "Current";
}

function sortDescription(sort: string): string {
  switch (sort) {
    case "-name":
      return "Sort: Name (Z–A)";
    case "balance":
      return "Sort: Balance (low → high)";
    case "-balance":
      return "Sort: Balance (high → low)";
    case "credits":
      return "Sort: Credits (low → high)";
    case "-credits":
      return "Sort: Credits (high → low)";
    case "debits":
      return "Sort: Debits (low → high)";
    case "-debits":
      return "Sort: Debits (high → low)";
    case "name":
    default:
      return "Sort: Name (A–Z)";
  }
}

const CLEAR_LINK =
  "rounded-md p-0.5 text-subtext-0 underline-offset-2 hover:text-foreground hover:underline";

function buildActiveToolbarChips(
  base: BankAccountsListState,
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
              href={bankAccountsListHref(base, { q: "" })}
              aria-label="Clear search"
            >
              ×
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

  if (base.type !== "all") {
    chips.push({
      id: "type",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={bankAccountsListHref(base, { type: "all" })}
              aria-label="Clear account type filter"
            >
              ×
            </Link>
          }
        >
          <span className="text-foreground">Type:</span>{" "}
          {accountTypeLabel(base.type)}
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
              href={bankAccountsListHref(base, { sort: "name" })}
              aria-label="Reset sort to name"
            >
              ×
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

function FilterMenu({ base }: { base: BankAccountsListState }) {
  return (
    <BankAccountsActionMenu
      triggerLabel="Filter by account type"
      triggerIcon={<Filter className="size-4" aria-hidden />}
      panelClassName="min-w-44"
    >
      <div>
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">
          Account type
        </p>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={bankAccountsListHref(base, { type: "all" })}
        >
          All
        </Link>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={bankAccountsListHref(base, { type: "savings" })}
        >
          Savings
        </Link>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={bankAccountsListHref(base, { type: "current" })}
        >
          Current
        </Link>
      </div>
    </BankAccountsActionMenu>
  );
}

function SortMenu({ base }: { base: BankAccountsListState }) {
  const items: { label: string; sort: string }[] = [
    { label: "Name (A–Z)", sort: "name" },
    { label: "Name (Z–A)", sort: "-name" },
    { label: "Balance (low → high)", sort: "balance" },
    { label: "Balance (high → low)", sort: "-balance" },
    { label: "Credits (low → high)", sort: "credits" },
    { label: "Credits (high → low)", sort: "-credits" },
    { label: "Debits (low → high)", sort: "debits" },
    { label: "Debits (high → low)", sort: "-debits" },
  ];

  return (
    <BankAccountsActionMenu
      triggerLabel="Choose sort order"
      triggerIcon={<ArrowDownUp className="size-4" aria-hidden />}
      panelClassName="max-h-72 min-w-56 overflow-y-auto"
    >
      <div>
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">
          Sort by
        </p>
        {items.map(({ label, sort }) => (
          <Link
            key={sort}
            className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
            href={bankAccountsListHref(base, { sort })}
          >
            {label}
          </Link>
        ))}
      </div>
    </BankAccountsActionMenu>
  );
}

function SearchForm({ base }: { base: BankAccountsListState }) {
  const preserved: { name: string; value: string }[] = [];
  if (base.type !== "all") preserved.push({ name: "type", value: base.type });
  if (base.sort && base.sort !== "name") {
    preserved.push({ name: "sort", value: base.sort });
  }

  return (
    <form
      method="get"
      action={getAppRoute("dashboardBankAccounts")}
      className="flex max-w-full items-center gap-1.5"
      role="search"
    >
      {preserved.map((h) => (
        <input key={h.name} type="hidden" name={h.name} value={h.value} />
      ))}
      <input
        type="search"
        name="q"
        defaultValue={base.q}
        placeholder="Search accounts…"
        className={INPUT_CLASS}
        aria-label="Search bank accounts"
        autoComplete="off"
      />
      <button type="submit" className={ICON_BTN} aria-label="Apply search">
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  );
}

type BankAccountEditFormValues = {
  name: string;
  description: string;
  accountType: BankAccountRow["accountType"];
  balance: string;
};

function BankAccountEditDialog({ row }: { row: BankAccountRow }) {
  const queryClient = useQueryClient();
  const updateMutation = useMutateUpdateBankAccount();
  const [open, setOpen] = React.useState(false);
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankAccountEditFormValues>({
    defaultValues: {
      name: row.name,
      description: row.description,
      accountType: row.accountType,
      balance: row.balance.toString(),
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: row.name,
        description: row.description,
        accountType: row.accountType,
        balance: row.balance.toString(),
      });
    }
  }, [open, reset, row]);

  async function onSubmit(values: BankAccountEditFormValues) {
    const balance = Number(values.balance);
    if (!Number.isFinite(balance)) {
      toast.error("Balance must be a valid number");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        accountId: row.id,
        name: values.name.trim(),
        description: values.description.trim(),
        accountType: values.accountType,
        balance,
      });
      await queryClient.invalidateQueries({
        queryKey: ["bank-accounts", "list"],
      });
      toast.success("Bank account updated");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update bank account",
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
          <DialogTitle>Edit bank account</DialogTitle>
          <DialogDescription>
            Update account details and balance.
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
            {...register("name", { required: "Bank account name is required" })}
          />
          <TextareaField
            label="Description"
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Balance"
              required
              type="number"
              step="0.01"
              error={errors.balance?.message}
              {...register("balance", { required: "Balance is required" })}
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

function BankAccountDeleteDialog({ row }: { row: BankAccountRow }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutateDeleteBankAccount();
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(row.id);
      await queryClient.invalidateQueries({
        queryKey: ["bank-accounts", "list"],
      });
      toast.success("Bank account deleted");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete bank account",
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
          <DialogTitle>Delete bank account?</DialogTitle>
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

export type BankAccountsTablePanelProps = {
  listState: BankAccountsListState;
  rows: BankAccountRow[];
};

export function BankAccountsTablePanel({
  listState,
  rows,
}: BankAccountsTablePanelProps) {
  const { user } = useUserProfile();
  const preferredCurrency = user?.preferredCurrency ?? "USD";
  const activeChips = buildActiveToolbarChips(listState);

  return (
    <TableComponent
      title="Accounts"
      activeChips={activeChips}
      filterSlot={<FilterMenu base={listState} />}
      sortSlot={<SortMenu base={listState} />}
      searchSlot={<SearchForm base={listState} />}
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-mantle/90 text-subtext-1">
            <th scope="col" className="px-4 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Description
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Account type
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Balance
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Credits this month
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Debits this month
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Buckets
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="text-foreground">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-subtext-1">
                No accounts match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-surface-1/40"
              >
                <td className="max-w-40 px-4 py-3 font-medium">{row.name}</td>
                <td className="max-w-xs px-4 py-3 text-subtext-1">
                  {row.description}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {accountTypeLabel(row.accountType)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatCurrency(row.balance, preferredCurrency)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatCurrency(row.creditsThisMonth, preferredCurrency)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatCurrency(row.debitsThisMonth, preferredCurrency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-56 flex-wrap gap-1.5">
                    {row.bucketNames.map((b) => (
                      <ChipComponent
                        key={b}
                        variant="filled"
                        className="max-w-full"
                      >
                        {b}
                      </ChipComponent>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <BankAccountEditDialog row={row} />
                    <BankAccountDeleteDialog row={row} />
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
