export type CreditCardCategory =
  | "Groceries"
  | "Rent"
  | "Travel"
  | "Dining"
  | "Shopping"
  | "Utilities";

export type CreditCardBillInfo = {
  cycleLabel: string;
  pdfUrl: string;
  isPaid: boolean;
};

export type CreditCardRow = {
  id: string;
  name: string;
  description: string;
  maxBalance: number;
  usedBalance: number;
  lockedBalance: number;
  preferredCategories: CreditCardCategory[];
  billGenerationDay: number;
  billDueDay: number;
  previousBill: CreditCardBillInfo | null;
};

export type CreditCardsListState = {
  q: string;
  category: "all" | CreditCardCategory;
  sort: string;
};
