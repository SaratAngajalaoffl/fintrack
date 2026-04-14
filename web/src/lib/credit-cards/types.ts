export type CreditCardCategory = string;

export type CreditCardBillInfo = {
  id: string;
  billGenerationDate: string;
  billDueDate: string;
  billPdfUrl: string | null;
  isBillPaid: boolean;
  billPaymentDate: string | null;
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
  latestBill: CreditCardBillInfo | null;
};

export type CreditCardsListState = {
  q: string;
  category: "all" | CreditCardCategory;
  sort: string;
};
