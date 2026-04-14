import {
  ArrowDownUp,
  CheckCircle2,
  Download,
  Filter,
  Search,
  TriangleAlert,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { useUserProfile } from "@/components/hooks";
import { Button } from "@/components/ui";
import { ChipComponent } from "@/components/ui/common/chip";
import {
  TableComponent,
  type TableToolbarChip,
} from "@/components/ui/common/table-component";
import {
  creditCardsListHref,
  getBillGenerationInDays,
} from "@/lib/credit-cards/list-state";
import type {
  CreditCardCategory,
  CreditCardRow,
  CreditCardsListState,
} from "@/lib/credit-cards/types";
import { formatNumber } from "@/lib/formatting/number-formatting";

import { CreditCardsActionMenu } from "./credit-cards-action-menu";

const INPUT_CLASS =
  "h-8 w-full min-w-[12rem] max-w-xs rounded-lg border border-border bg-muted px-2.5 py-1.5 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-0/90 text-foreground shadow-sm transition-colors hover:bg-surface-1";

const CLEAR_LINK =
  "rounded-md p-0.5 text-subtext-0 underline-offset-2 hover:text-foreground hover:underline";

function money(value: number, currency: string) {
  return formatNumber(value, "en-US", {
    style: "currency",
    currency,
  });
}

function utilizationPercent(row: CreditCardRow): number {
  if (row.maxBalance <= 0) return 0;
  return (row.usedBalance / row.maxBalance) * 100;
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
      action="/dashboard/credit-cards"
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
              Bill generation in
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Previous bill
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Bill paid
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
              const dueDateLabel = `Due day ${row.billDueDay}`;
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
                    {money(row.maxBalance, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {money(row.usedBalance, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {money(row.lockedBalance, preferredCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatNumber(utilization, "en-US", {
                      style: "percent",
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
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
                    {formatNumber(billGenerationIn, "en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    days
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.previousBill ? (
                      <Link
                        href={row.previousBill.pdfUrl}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface-0 px-2 py-1 text-xs font-medium text-foreground hover:bg-surface-1"
                      >
                        <Download className="size-3.5" aria-hidden />
                        Download PDF
                      </Link>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled
                      >
                        <Upload className="mr-1 size-3.5" aria-hidden />
                        Upload bill
                      </Button>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.previousBill?.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle2 className="size-4" aria-hidden />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-300">
                        <TriangleAlert className="size-4" aria-hidden />
                        Pending - {dueDateLabel}
                      </span>
                    )}
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
              );
            })
          )}
        </tbody>
      </table>
    </TableComponent>
  );
}
