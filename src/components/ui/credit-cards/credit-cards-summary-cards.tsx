import { useUserProfile } from "@/components/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatNumber } from "@/lib/formatting/number-formatting";

type CreditCardsSummaryCardsProps = {
  numberOfCards: number;
  totalBalance: number;
  totalUsage: number;
  totalLocked: number;
};

export function CreditCardsSummaryCards({
  numberOfCards,
  totalBalance,
  totalUsage,
  totalLocked,
}: CreditCardsSummaryCardsProps) {
  const { user } = useUserProfile();
  const preferredCurrency = user?.preferredCurrency ?? "USD";

  const money = (value: number) =>
    formatNumber(value, "en-US", {
      style: "currency",
      currency: preferredCurrency,
    });

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Number of cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatNumber(numberOfCards, "en-US", { maximumFractionDigits: 0 })}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Total balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {money(totalBalance)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Total usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {money(totalUsage)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-surface-0/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-subtext-1">
            Total locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {money(totalLocked)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
