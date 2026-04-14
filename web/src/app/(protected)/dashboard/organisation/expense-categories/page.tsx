import {
  ExpenseCategoriesDataPanel,
  ExpenseCategoryCreateDialog,
} from "@/components/ui/expense-categories";
import { parseExpenseCategoriesListState } from "@/lib/expense-categories/list-state";

export const metadata = {
  title: "Expense Categories — Fintrack",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganisationExpenseCategoriesPage({
  searchParams,
}: PageProps) {
  const raw = await searchParams;
  const listState = parseExpenseCategoriesListState(raw);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Expense Categories
        </h1>
        <ExpenseCategoryCreateDialog />
      </div>

      <ExpenseCategoriesDataPanel listState={listState} />
    </div>
  );
}
