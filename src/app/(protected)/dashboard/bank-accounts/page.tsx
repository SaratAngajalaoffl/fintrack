import Link from "next/link";

import { Button } from "@/components/ui";
import { BankAccountsDataPanel } from "@/components/ui/bank-accounts";
import { getAppRoute } from "@/configs/app-routes";
import { parseBankAccountsListState } from "@/lib/bank-accounts/list-state";

export const metadata = {
  title: "Bank Accounts — Fintrack",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BankAccountsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const listState = parseBankAccountsListState(raw);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Bank Accounts
        </h1>
        <Button asChild className="shrink-0">
          <Link href={getAppRoute("dashboardBankAccountsNew")}>
            Add new account
          </Link>
        </Button>
      </div>

      <BankAccountsDataPanel listState={listState} />
    </div>
  );
}
