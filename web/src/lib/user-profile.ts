export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "INR",
  "BRL",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "USD";

export function parsePreferredCurrency(value: string): SupportedCurrency {
  const normalized = value.trim().toUpperCase();
  if (SUPPORTED_CURRENCIES.includes(normalized as SupportedCurrency)) {
    return normalized as SupportedCurrency;
  }
  return DEFAULT_CURRENCY;
}

export function validatePreferredCurrency(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  if (!SUPPORTED_CURRENCIES.includes(normalized as SupportedCurrency)) {
    return "Select a supported currency";
  }
  return null;
}

export function normalizeProfileName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function validateProfileName(name: string): string | null {
  const normalized = normalizeProfileName(name);
  if (normalized.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (normalized.length > 80) {
    return "Name must be at most 80 characters";
  }
  return null;
}
