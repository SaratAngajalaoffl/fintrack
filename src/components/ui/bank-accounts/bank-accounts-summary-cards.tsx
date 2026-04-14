import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatNumber } from "@/lib/formatting/number-formatting";

export type BankAccountsSummaryCardsProps = {
  totalAccounts: number;
  totalBalances: number;
  totalBuckets: number;
};

export function BankAccountsSummaryCards({
  totalAccounts,
  totalBalances,
  totalBuckets,
}: BankAccountsSummaryCardsProps) {
  const balanceLabel = formatNumber(totalBalances, "en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Total accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatNumber(totalAccounts, "en-US", {
              maximumFractionDigits: 0,
            })}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Total balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {balanceLabel}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Total buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatNumber(totalBuckets, "en-US", {
              maximumFractionDigits: 0,
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
