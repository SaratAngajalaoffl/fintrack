import { ArrowDownUp, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/icon-picker";
import {
  TableComponent,
  type TableToolbarChip,
} from "@/components/ui/common/table-component";
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
      action="/dashboard/expenses"
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
