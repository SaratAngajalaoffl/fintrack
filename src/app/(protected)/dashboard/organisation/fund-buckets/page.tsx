import {
  FundBucketCreateDialog,
  FundBucketsDataPanel,
} from "@/components/ui/fund-buckets";
import { parseFundBucketsListState } from "@/lib/fund-buckets/list-state";

export const metadata = {
  title: "Fund Buckets — Fintrack",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FundBucketsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const listState = parseFundBucketsListState(raw);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Fund Buckets
        </h1>
        <FundBucketCreateDialog />
      </div>

      <FundBucketsDataPanel listState={listState} />
    </div>
  );
}
