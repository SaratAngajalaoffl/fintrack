/** Number presentation helpers (extend as features need). */

import { DEFAULT_CURRENCY, type SupportedCurrency } from "@/lib/user-profile";

export function formatNumber(
  value: number,
  locale = "en-US",
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

function getCurrencyLocale(currency: SupportedCurrency): string {
  return currency === "INR" ? "en-IN" : "en-US";
}

export function formatCurrency(
  value: number,
  currency: SupportedCurrency | undefined = DEFAULT_CURRENCY,
): string {
  const resolvedCurrency = currency ?? DEFAULT_CURRENCY;
  return formatNumber(value, getCurrencyLocale(resolvedCurrency), {
    style: "currency",
    currency: resolvedCurrency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
