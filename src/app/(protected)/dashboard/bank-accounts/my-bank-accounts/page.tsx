import {
  BankAccountCreateDialog,
  BankAccountsDataPanel,
} from "@/components/ui/bank-accounts";
import { parseBankAccountsListState } from "@/lib/bank-accounts/list-state";

export const metadata = {
  title: "Bank Accounts — Fintrack",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyBankAccountsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const listState = parseBankAccountsListState(raw);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Bank Accounts
        </h1>
        <BankAccountCreateDialog />
      </div>

      <BankAccountsDataPanel listState={listState} />
    </div>
  );
}
