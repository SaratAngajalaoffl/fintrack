"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownUp, Filter, Pencil, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  useGetBankAccounts,
  useMutateAllocateFundBucket,
  useMutateSetFundBucketPriority,
  useMutateUnlockFundBucket,
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
  TableComponent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type TableToolbarChip,
} from "@/components/ui";
import { ChipComponent } from "@/components/ui/common/chip";
import { getAppRoute } from "@/configs/app-routes";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/formatting/number-formatting";
import { fundBucketsListHref } from "@/lib/fund-buckets/list-state";
import type {
  FundBucketPriority,
  FundBucketsListState,
  FundBucketRow,
} from "@/lib/fund-buckets/types";

const INPUT_CLASS =
  "h-8 w-full min-w-[12rem] max-w-xs rounded-lg border border-border bg-muted px-2.5 py-1.5 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-0/90 text-foreground shadow-sm transition-colors hover:bg-surface-1";

const CLEAR_LINK =
  "rounded-md p-0.5 text-subtext-0 underline-offset-2 hover:text-foreground hover:underline";

function progressPercent(row: FundBucketRow): number {
  if (row.targetAmount <= 0) return 0;
  return row.currentValue / row.targetAmount;
}

function sortDescription(sort: string): string {
  switch (sort) {
    case "name":
      return "Sort: Name (A-Z)";
    case "-name":
      return "Sort: Name (Z-A)";
    case "bankAccount":
      return "Sort: Bank account (A-Z)";
    case "-bankAccount":
      return "Sort: Bank account (Z-A)";
    case "target":
      return "Sort: Target (low to high)";
    case "-target":
      return "Sort: Target (high to low)";
    case "current":
      return "Sort: Current value (low to high)";
    case "-current":
      return "Sort: Current value (high to low)";
    case "priority":
      return "Sort: Priority (A-Z)";
    case "-priority":
      return "Sort: Priority (Z-A)";
    case "progress":
      return "Sort: Progress (low to high)";
    case "-progress":
    default:
      return "Sort: Progress (high to low)";
  }
}

function buildActiveToolbarChips(
  base: FundBucketsListState,
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
              href={fundBucketsListHref(base, { q: "" })}
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

  if (base.status !== "all") {
    chips.push({
      id: "status",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={fundBucketsListHref(base, { status: "all" })}
              aria-label="Clear status filter"
            >
              x
            </Link>
          }
        >
          <span className="text-foreground">Status:</span> {base.status}
        </ChipComponent>
      ),
    });
  }

  if (base.priority !== "all") {
    chips.push({
      id: "priority",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={fundBucketsListHref(base, { priority: "all" })}
              aria-label="Clear priority filter"
            >
              x
            </Link>
          }
        >
          <span className="text-foreground">Priority:</span> {base.priority}
        </ChipComponent>
      ),
    });
  }

  if (base.sort && base.sort !== "-progress") {
    chips.push({
      id: "sort",
      node: (
        <ChipComponent
          variant="outline"
          trailing={
            <Link
              className={CLEAR_LINK}
              href={fundBucketsListHref(base, { sort: "-progress" })}
              aria-label="Reset sort"
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

function FilterMenu({ base }: { base: FundBucketsListState }) {
  return (
    <details className="relative">
      <summary className={ICON_BTN}>
        <Filter className="size-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-30 mt-1 min-w-48 rounded-xl border border-border/80 bg-surface-0 py-1 shadow-lg">
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">Status</p>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={fundBucketsListHref(base, { status: "all" })}
        >
          All
        </Link>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={fundBucketsListHref(base, { status: "locked" })}
        >
          Locked
        </Link>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={fundBucketsListHref(base, { status: "unlocked" })}
        >
          Unlocked
        </Link>
        <div className="my-1 border-t border-border/60" />
        <p className="px-3 py-1.5 text-xs font-medium text-subtext-1">
          Priority
        </p>
        <Link
          className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
          href={fundBucketsListHref(base, { priority: "all" })}
        >
          All
        </Link>
        {(["high", "medium", "low"] as const).map((priority) => (
          <Link
            key={priority}
            className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
            href={fundBucketsListHref(base, { priority })}
          >
            {priority}
          </Link>
        ))}
      </div>
    </details>
  );
}

function SortMenu({ base }: { base: FundBucketsListState }) {
  const items = [
    { label: "Progress (high to low)", sort: "-progress" },
    { label: "Progress (low to high)", sort: "progress" },
    { label: "Name (A-Z)", sort: "name" },
    { label: "Name (Z-A)", sort: "-name" },
    { label: "Bank account (A-Z)", sort: "bankAccount" },
    { label: "Bank account (Z-A)", sort: "-bankAccount" },
    { label: "Target (high to low)", sort: "-target" },
    { label: "Target (low to high)", sort: "target" },
    { label: "Current value (high to low)", sort: "-current" },
    { label: "Current value (low to high)", sort: "current" },
    { label: "Priority (A-Z)", sort: "priority" },
    { label: "Priority (Z-A)", sort: "-priority" },
  ];

  return (
    <details className="relative">
      <summary className={ICON_BTN}>
        <ArrowDownUp className="size-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-30 mt-1 min-w-64 rounded-xl border border-border/80 bg-surface-0 py-1 shadow-lg">
        {items.map((item) => (
          <Link
            key={item.sort}
            className="block px-3 py-2 text-sm text-foreground hover:bg-surface-1"
            href={fundBucketsListHref(base, { sort: item.sort })}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function SearchForm({ base }: { base: FundBucketsListState }) {
  const preserved: { name: string; value: string }[] = [];
  if (base.status !== "all")
    preserved.push({ name: "status", value: base.status });
  if (base.priority !== "all") {
    preserved.push({ name: "priority", value: base.priority });
  }
  if (base.sort && base.sort !== "-progress") {
    preserved.push({ name: "sort", value: base.sort });
  }

  return (
    <form
      method="get"
      action={getAppRoute("dashboardFundBuckets")}
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
        placeholder="Search fund buckets..."
        className={INPUT_CLASS}
        aria-label="Search fund buckets"
        autoComplete="off"
      />
      <button type="submit" className={ICON_BTN} aria-label="Apply search">
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  );
}

const ALLOCATION_STEP = 1000;
const MIN_ALLOCATION = 1000;

function FundBucketEditDialog({
  row,
  freeBalance,
}: {
  row: FundBucketRow;
  freeBalance: number;
}) {
  const queryClient = useQueryClient();
  const allocateMutation = useMutateAllocateFundBucket();
  const setPriorityMutation = useMutateSetFundBucketPriority();
  const unlockMutation = useMutateUnlockFundBucket();
  const [open, setOpen] = React.useState(false);
  const maxAllocation = Math.max(
    0,
    Math.floor(freeBalance / ALLOCATION_STEP) * ALLOCATION_STEP,
  );
  const canAllocate = row.isLocked && maxAllocation >= MIN_ALLOCATION;
  const sliderMin = canAllocate ? MIN_ALLOCATION : 0;
  const sliderMax = canAllocate ? maxAllocation : 0;
  const [allocationAmount, setAllocationAmount] = React.useState(
    canAllocate ? MIN_ALLOCATION : 0,
  );

  React.useEffect(() => {
    if (!open) return;
    setAllocationAmount(canAllocate ? MIN_ALLOCATION : 0);
  }, [open, canAllocate]);

  async function onAllocate() {
    if (!canAllocate) {
      toast.error("Not enough free balance available for allocation");
      return;
    }

    try {
      await allocateMutation.mutateAsync({
        bucketId: row.id,
        amount: allocationAmount,
      });
      await queryClient.invalidateQueries({
        queryKey: ["fund-buckets", "list"],
      });
      toast.success("Funds allocated");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not allocate funds",
      );
    }
  }

  async function onPriorityChange(nextPriority: FundBucketPriority) {
    try {
      await setPriorityMutation.mutateAsync({
        bucketId: row.id,
        priority: nextPriority,
      });
      await queryClient.invalidateQueries({
        queryKey: ["fund-buckets", "list"],
      });
      toast.success("Priority updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update priority",
      );
    }
  }

  const canUnlock = row.isLocked && row.currentValue >= row.targetAmount;

  async function onUnlock() {
    try {
      await unlockMutation.mutateAsync(row.id);
      await queryClient.invalidateQueries({
        queryKey: ["fund-buckets", "list"],
      });
      toast.success("Fund bucket unlocked");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not unlock fund bucket",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${row.name}`}
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit fund bucket</DialogTitle>
          <DialogDescription>
            Manage allocation, priority, and unlock for{" "}
            <span className="font-medium text-foreground">{row.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Allocate funds
              </p>
              <p className="text-xs text-subtext-1">
                Range: {formatCurrency(MIN_ALLOCATION)} to{" "}
                {formatCurrency(maxAllocation)} (step{" "}
                {formatCurrency(ALLOCATION_STEP)})
              </p>
            </div>
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={ALLOCATION_STEP}
              value={allocationAmount}
              onChange={(event) =>
                setAllocationAmount(Number(event.target.value) || sliderMin)
              }
              className="w-full accent-primary"
              disabled={!canAllocate}
            />
            <p className="text-sm text-foreground">
              Selected amount:{" "}
              <span className="font-semibold tabular-nums">
                {formatCurrency(allocationAmount)}
              </span>
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={onAllocate}
                disabled={!canAllocate || allocateMutation.isPending}
              >
                {allocateMutation.isPending ? "Allocating..." : "Allocate"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Set priority</p>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={row.priority === value ? "secondary" : "ghost"}
                  size="sm"
                  className="capitalize"
                  onClick={() => onPriorityChange(value)}
                  disabled={setPriorityMutation.isPending}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-surface-0/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Unlock bucket
                </p>
                <p className="text-xs text-subtext-1">
                  Available when current value reaches target amount.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onUnlock}
                disabled={!canUnlock || unlockMutation.isPending}
              >
                {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type FundBucketsTablePanelProps = {
  listState: FundBucketsListState;
  rows: FundBucketRow[];
  allRows: FundBucketRow[];
};

export function FundBucketsTablePanel({
  listState,
  rows,
  allRows,
}: FundBucketsTablePanelProps) {
  const { user } = useUserProfile();
  const bankAccountsQuery = useGetBankAccounts();
  const preferredCurrency = user?.preferredCurrency ?? "USD";
  const activeChips = buildActiveToolbarChips(listState);
  const accountBalanceById = React.useMemo(() => {
    return new Map(
      (bankAccountsQuery.data ?? []).map((account) => [
        account.id,
        account.balance,
      ]),
    );
  }, [bankAccountsQuery.data]);
  const lockedTotalsByAccountId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const bucket of allRows) {
      if (!bucket.isLocked) continue;
      map.set(
        bucket.bankAccountId,
        (map.get(bucket.bankAccountId) ?? 0) + bucket.currentValue,
      );
    }
    return map;
  }, [allRows]);

  return (
    <TableComponent
      title="Fund buckets"
      activeChips={activeChips}
      filterSlot={<FilterMenu base={listState} />}
      sortSlot={<SortMenu base={listState} />}
      searchSlot={<SearchForm base={listState} />}
    >
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-mantle/90 text-subtext-1">
            <th scope="col" className="px-4 py-3 font-medium">
              Bucket
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Bank account
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Target
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Current
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Progress
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Priority
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
                No fund buckets match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const progress = progressPercent(row);
              const clampedProgress = Math.max(0, Math.min(progress, 1));
              const progressPercentLabel = formatNumber(progress, "en-US", {
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              });

              return (
                <tr
                  key={row.id}
                  className="border-b border-border/40 transition-colors hover:bg-surface-1/40"
                >
                  <td className="max-w-52 px-4 py-3 font-medium">{row.name}</td>
                  <td className="max-w-52 px-4 py-3 text-subtext-1">
                    {row.bankAccountName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(row.targetAmount, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(row.currentValue, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-2.5 w-28 overflow-hidden rounded-full bg-surface-2/60"
                            role="img"
                            aria-label={`Progress ${progressPercentLabel}`}
                          >
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${clampedProgress * 100}%` }}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{progressPercentLabel}</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ChipComponent
                      variant={row.isLocked ? "outline" : "filled"}
                      className="capitalize"
                    >
                      {row.isLocked ? "locked" : "unlocked"}
                    </ChipComponent>
                  </td>
                  <td className="px-4 py-3 capitalize">{row.priority}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <FundBucketEditDialog
                      row={row}
                      freeBalance={Math.max(
                        0,
                        (accountBalanceById.get(row.bankAccountId) ?? 0) -
                          (lockedTotalsByAccountId.get(row.bankAccountId) ?? 0),
                      )}
                    />
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
