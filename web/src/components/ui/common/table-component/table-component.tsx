import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TableToolbarChip = {
  id: string;
  node: ReactNode;
};

export type TableComponentProps = {
  /** Shown on the left of the toolbar row (e.g. section title). */
  title: string;
  /** Outline-style chips for active filter / sort / search (before action controls). */
  activeChips?: TableToolbarChip[];
  /** Typically a no-JS menu (`<details>`) or link group for account type / category. */
  filterSlot?: ReactNode;
  /** Sort options targeting the same route with updated query string. */
  sortSlot?: ReactNode;
  /** Usually a GET `<form>` so search works without client JS. */
  searchSlot?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * Table shell with a toolbar row: title on the left; active chips and floating
 * filter / sort / search controls on the right, above the table element.
 */
export function TableComponent({
  title,
  activeChips = [],
  filterSlot,
  sortSlot,
  searchSlot,
  className,
  children,
}: TableComponentProps) {
  const hasToolbarActions = filterSlot || sortSlot || searchSlot;
  const hasChips = activeChips.length > 0;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <h2 className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {(hasChips || hasToolbarActions) && (
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              {activeChips.map((chip) => (
                <span key={chip.id} className="max-w-full">
                  {chip.node}
                </span>
              ))}
              {hasToolbarActions ? (
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  {hasChips ? (
                    <span
                      className="hidden h-6 w-px shrink-0 bg-border/80 sm:inline-block"
                      aria-hidden
                    />
                  ) : null}
                  {filterSlot}
                  {sortSlot}
                  {searchSlot}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className="relative w-full overflow-x-auto rounded-xl border border-border/80 bg-surface-0/40 shadow-sm">
        {children}
      </div>
    </div>
  );
}
