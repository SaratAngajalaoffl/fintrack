import type {
  CreditCardCategory,
  CreditCardRow,
} from "@/lib/credit-cards/types";

export const MOCK_CREDIT_CARDS: CreditCardRow[] = [
  {
    id: "cc-1",
    name: "Atlas Rewards",
    description: "Primary daily-spend rewards card",
    maxBalance: 8_000,
    usedBalance: 2_650.25,
    lockedBalance: 430,
    preferredCategories: ["Groceries", "Dining", "Travel"],
    billGenerationDay: 18,
    billDueDay: 1,
    latestBill: {
      id: "bill-1",
      billGenerationDate: "2026-03-18",
      billDueDate: "2026-04-01",
      billPdfUrl: "#",
      isBillPaid: true,
      billPaymentDate: "2026-03-28",
    },
  },
  {
    id: "cc-2",
    name: "Home Essentials",
    description: "Rent and utility linked card",
    maxBalance: 5_000,
    usedBalance: 3_240,
    lockedBalance: 760.5,
    preferredCategories: ["Rent", "Utilities"],
    billGenerationDay: 12,
    billDueDay: 25,
    latestBill: {
      id: "bill-2",
      billGenerationDate: "2026-03-12",
      billDueDate: "2026-03-25",
      billPdfUrl: "#",
      isBillPaid: false,
      billPaymentDate: null,
    },
  },
  {
    id: "cc-3",
    name: "Voyager Miles",
    description: "Flight and hotel booking card",
    maxBalance: 12_000,
    usedBalance: 1_125.75,
    lockedBalance: 0,
    preferredCategories: ["Travel", "Shopping"],
    billGenerationDay: 27,
    billDueDay: 8,
    latestBill: null,
  },
];

export function creditCardsSummary(cards: CreditCardRow[]) {
  const numberOfCards = cards.length;
  const totalBalance = cards.reduce((sum, row) => sum + row.maxBalance, 0);
  const totalUsage = cards.reduce((sum, row) => sum + row.usedBalance, 0);
  const totalLocked = cards.reduce((sum, row) => sum + row.lockedBalance, 0);

  return { numberOfCards, totalBalance, totalUsage, totalLocked };
}

export function allCreditCardCategories(
  cards: CreditCardRow[],
): CreditCardCategory[] {
  const categories = new Set<CreditCardCategory>();
  cards.forEach((card) => {
    card.preferredCategories.forEach((category) => categories.add(category));
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
