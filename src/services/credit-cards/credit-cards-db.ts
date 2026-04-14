import { getPool } from "@/lib/db";
import type { CreditCardRow } from "@/lib/credit-cards/types";

type CreditCardDbRow = {
  id: string;
  name: string;
  description: string;
  max_balance: string | number;
  used_balance: string | number;
  locked_balance: string | number;
  preferred_categories: string[] | null;
  bill_generation_day: number;
  bill_due_day: number;
  previous_bill_cycle_label: string | null;
  previous_bill_pdf_url: string | null;
  previous_bill_paid: boolean;
};

export type CreateCreditCardInput = {
  userId: string;
  name: string;
  description: string;
  maxBalance: number;
  usedBalance: number;
  lockedBalance: number;
  preferredCategories: string[];
  billGenerationDay: number;
  billDueDay: number;
  previousBillCycleLabel?: string | null;
  previousBillPdfUrl?: string | null;
  previousBillPaid?: boolean;
};

export type UpdateCreditCardInput = {
  userId: string;
  cardId: string;
  name?: string;
  description?: string;
  maxBalance?: number;
  usedBalance?: number;
  lockedBalance?: number;
  preferredCategories?: string[];
  billGenerationDay?: number;
  billDueDay?: number;
  previousBillCycleLabel?: string | null;
  previousBillPdfUrl?: string | null;
  previousBillPaid?: boolean;
};

function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  return Number(value);
}

function mapRow(row: CreditCardDbRow): CreditCardRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    maxBalance: toNumber(row.max_balance),
    usedBalance: toNumber(row.used_balance),
    lockedBalance: toNumber(row.locked_balance),
    preferredCategories: (row.preferred_categories ??
      []) as CreditCardRow["preferredCategories"],
    billGenerationDay: row.bill_generation_day,
    billDueDay: row.bill_due_day,
    previousBill:
      row.previous_bill_cycle_label && row.previous_bill_pdf_url
        ? {
            cycleLabel: row.previous_bill_cycle_label,
            pdfUrl: row.previous_bill_pdf_url,
            isPaid: row.previous_bill_paid,
          }
        : null,
  };
}

export async function listCreditCards(
  userId: string,
): Promise<CreditCardRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<CreditCardDbRow>(
    `
      SELECT
        id,
        name,
        description,
        max_balance,
        used_balance,
        locked_balance,
        preferred_categories,
        bill_generation_day,
        bill_due_day,
        previous_bill_cycle_label,
        previous_bill_pdf_url,
        previous_bill_paid
      FROM credit_cards
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );
  return rows.map(mapRow);
}

export async function getCreditCardById(
  userId: string,
  cardId: string,
): Promise<CreditCardRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<CreditCardDbRow>(
    `
      SELECT
        id,
        name,
        description,
        max_balance,
        used_balance,
        locked_balance,
        preferred_categories,
        bill_generation_day,
        bill_due_day,
        previous_bill_cycle_label,
        previous_bill_pdf_url,
        previous_bill_paid
      FROM credit_cards
      WHERE user_id = $1 AND id = $2
      LIMIT 1
    `,
    [userId, cardId],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createCreditCard(
  input: CreateCreditCardInput,
): Promise<CreditCardRow> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: string }>(
    `
      INSERT INTO credit_cards (
        user_id,
        name,
        description,
        max_balance,
        used_balance,
        locked_balance,
        preferred_categories,
        bill_generation_day,
        bill_due_day,
        previous_bill_cycle_label,
        previous_bill_pdf_url,
        previous_bill_paid
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
    `,
    [
      input.userId,
      input.name,
      input.description,
      input.maxBalance,
      input.usedBalance,
      input.lockedBalance,
      input.preferredCategories,
      input.billGenerationDay,
      input.billDueDay,
      input.previousBillCycleLabel ?? null,
      input.previousBillPdfUrl ?? null,
      input.previousBillPaid ?? false,
    ],
  );

  const card = await getCreditCardById(input.userId, rows[0].id);
  if (!card) {
    throw new Error("Created credit card could not be fetched");
  }
  return card;
}

export async function updateCreditCard(
  input: UpdateCreditCardInput,
): Promise<CreditCardRow | null> {
  const pool = getPool();
  const { rowCount } = await pool.query(
    `
      UPDATE credit_cards
      SET
        name = COALESCE($3, name),
        description = COALESCE($4, description),
        max_balance = COALESCE($5, max_balance),
        used_balance = COALESCE($6, used_balance),
        locked_balance = COALESCE($7, locked_balance),
        preferred_categories = COALESCE($8, preferred_categories),
        bill_generation_day = COALESCE($9, bill_generation_day),
        bill_due_day = COALESCE($10, bill_due_day),
        previous_bill_cycle_label = COALESCE($11, previous_bill_cycle_label),
        previous_bill_pdf_url = COALESCE($12, previous_bill_pdf_url),
        previous_bill_paid = COALESCE($13, previous_bill_paid),
        updated_at = NOW()
      WHERE user_id = $1 AND id = $2
    `,
    [
      input.userId,
      input.cardId,
      input.name ?? null,
      input.description ?? null,
      input.maxBalance ?? null,
      input.usedBalance ?? null,
      input.lockedBalance ?? null,
      input.preferredCategories ?? null,
      input.billGenerationDay ?? null,
      input.billDueDay ?? null,
      input.previousBillCycleLabel ?? null,
      input.previousBillPdfUrl ?? null,
      input.previousBillPaid ?? null,
    ],
  );

  if ((rowCount ?? 0) === 0) return null;
  return getCreditCardById(input.userId, input.cardId);
}

export async function deleteCreditCard(
  userId: string,
  cardId: string,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `DELETE FROM credit_cards WHERE user_id = $1 AND id = $2`,
    [userId, cardId],
  );
  return (result.rowCount ?? 0) > 0;
}
