import { ArrowDownUp, Filter, Search } from "lucide-react";
import Link from "next/link";

import { useUserProfile } from "@/components/hooks";
import { Button } from "@/components/ui";
import { ChipComponent } from "@/components/ui/common/chip";
import {
  TableComponent,
  type TableToolbarChip,
} from "@/components/ui/common/table-component";
import type {
  BankAccountRow,
  BankAccountsListState,
} from "@/lib/bank-accounts/types";
import { bankAccountsListHref } from "@/lib/bank-accounts/list-state";
import { formatNumber } from "@/lib/formatting/number-formatting";
import { BankAccountsActionMenu } from "@/components/ui/bank-accounts/bank-accounts-action-menu";

const INPUT_CLASS =
  "h-8 w-full min-w-[12rem] max-w-xs rounded-lg border border-border bg-muted px-2.5 py-1.5 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-0/90 text-foreground shadow-sm transition-colors hover:bg-surface-1";

function accountTypeLabel(type: BankAccountRow["accountType"]): string {
  return type === "savings" ? "Savings" : "Current";
}

function money(value: number, currency: string) {
  return formatNumber(value, "en-US", {
    style: "currency",
    currency,
  });
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
      action="/dashboard/bank-accounts"
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
                  {money(row.balance, preferredCurrency)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {money(row.creditsThisMonth, preferredCurrency)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {money(row.debitsThisMonth, preferredCurrency)}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive"
                      disabled
                    >
                      Delete
                    </Button>
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
