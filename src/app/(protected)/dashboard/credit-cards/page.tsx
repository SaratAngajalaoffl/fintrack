import {
  CreditCardCreateDialog,
  CreditCardsDataPanel,
} from "@/components/ui/credit-cards";
import { parseCreditCardsListState } from "@/lib/credit-cards/list-state";

export const metadata = {
  title: "Credit cards — Fintrack",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CreditCardsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const listState = parseCreditCardsListState(raw);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Credit Cards
        </h1>
        <CreditCardCreateDialog />
      </div>

      <CreditCardsDataPanel listState={listState} />
    </div>
  );
}
