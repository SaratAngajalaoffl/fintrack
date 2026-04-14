import { getPool } from "@/lib/db";
import type { CreditCardRow } from "@/lib/credit-cards/types";
import type { PoolClient } from "pg";

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
  latest_bill_id: string | null;
  latest_bill_generation_date: string | null;
  latest_bill_due_date: string | null;
  latest_bill_pdf_url: string | null;
  latest_bill_paid: boolean | null;
  latest_bill_payment_date: string | null;
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
};

function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  return Number(value);
}

function normalizePreferredCategories(input: string[]): string[] {
  return Array.from(
    new Set(input.map((item) => item.trim()).filter((item) => item.length > 0)),
  );
}

async function resolvePreferredCategoryIds(
  client: PoolClient,
  userId: string,
  preferredCategories: string[],
): Promise<string[]> {
  if (preferredCategories.length === 0) return [];

  const { rows } = await client.query<{ id: string; name: string }>(
    `
      SELECT id, name
      FROM expense_categories
      WHERE user_id = $1 AND name = ANY($2::text[])
    `,
    [userId, preferredCategories],
  );

  const foundByName = new Map(rows.map((row) => [row.name, row.id]));
  const missing = preferredCategories.filter((name) => !foundByName.has(name));
  if (missing.length > 0) {
    throw new Error(
      `Invalid preferred categories: ${missing.join(", ")}. Create them in Expense Categories first.`,
    );
  }

  return preferredCategories.map((name) => foundByName.get(name) as string);
}

async function syncPreferredCategoryMappings(
  client: PoolClient,
  userId: string,
  cardId: string,
  preferredCategories: string[],
): Promise<void> {
  const categoryIds = await resolvePreferredCategoryIds(
    client,
    userId,
    preferredCategories,
  );

  await client.query(
    `
      DELETE FROM credit_card_preferred_categories
      WHERE user_id = $1 AND credit_card_id = $2
    `,
    [userId, cardId],
  );

  if (categoryIds.length === 0) {
    return;
  }

  await client.query(
    `
      INSERT INTO credit_card_preferred_categories (
        credit_card_id,
        expense_category_id,
        user_id
      )
      SELECT $1, ids.category_id, $2
      FROM unnest($3::uuid[]) AS ids(category_id)
      ON CONFLICT (credit_card_id, expense_category_id) DO NOTHING
    `,
    [cardId, userId, categoryIds],
  );
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
    latestBill:
      row.latest_bill_id &&
      row.latest_bill_generation_date &&
      row.latest_bill_due_date
        ? {
            id: row.latest_bill_id,
            billGenerationDate: row.latest_bill_generation_date,
            billDueDate: row.latest_bill_due_date,
            billPdfUrl: row.latest_bill_pdf_url,
            isBillPaid: row.latest_bill_paid ?? false,
            billPaymentDate: row.latest_bill_payment_date,
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
        cc.id,
        cc.name,
        cc.description,
        cc.max_balance,
        cc.used_balance,
        cc.locked_balance,
        COALESCE(
          array_agg(ec.name ORDER BY ec.name) FILTER (WHERE ec.name IS NOT NULL),
          '{}'
        ) AS preferred_categories,
        cc.bill_generation_day,
        cc.bill_due_day,
        lb.id AS latest_bill_id,
        lb.bill_generation_date::text AS latest_bill_generation_date,
        lb.bill_due_date::text AS latest_bill_due_date,
        lb.bill_pdf_url AS latest_bill_pdf_url,
        lb.is_bill_paid AS latest_bill_paid,
        lb.bill_payment_date::text AS latest_bill_payment_date
      FROM credit_cards cc
      LEFT JOIN credit_card_preferred_categories ccpc
        ON ccpc.credit_card_id = cc.id
       AND ccpc.user_id = cc.user_id
      LEFT JOIN expense_categories ec
        ON ec.id = ccpc.expense_category_id
       AND ec.user_id = cc.user_id
      LEFT JOIN LATERAL (
        SELECT
          ccb.id,
          ccb.bill_generation_date,
          ccb.bill_due_date,
          ccb.bill_pdf_url,
          ccb.is_bill_paid,
          ccb.bill_payment_date
        FROM credit_card_bills ccb
        WHERE ccb.user_id = cc.user_id
          AND ccb.credit_card_id = cc.id
        ORDER BY ccb.bill_generation_date DESC
        LIMIT 1
      ) lb ON TRUE
      WHERE cc.user_id = $1
      GROUP BY
        cc.id,
        lb.id,
        lb.bill_generation_date,
        lb.bill_due_date,
        lb.bill_pdf_url,
        lb.is_bill_paid,
        lb.bill_payment_date
      ORDER BY cc.created_at DESC
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
        cc.id,
        cc.name,
        cc.description,
        cc.max_balance,
        cc.used_balance,
        cc.locked_balance,
        COALESCE(
          array_agg(ec.name ORDER BY ec.name) FILTER (WHERE ec.name IS NOT NULL),
          '{}'
        ) AS preferred_categories,
        cc.bill_generation_day,
        cc.bill_due_day,
        lb.id AS latest_bill_id,
        lb.bill_generation_date::text AS latest_bill_generation_date,
        lb.bill_due_date::text AS latest_bill_due_date,
        lb.bill_pdf_url AS latest_bill_pdf_url,
        lb.is_bill_paid AS latest_bill_paid,
        lb.bill_payment_date::text AS latest_bill_payment_date
      FROM credit_cards cc
      LEFT JOIN credit_card_preferred_categories ccpc
        ON ccpc.credit_card_id = cc.id
       AND ccpc.user_id = cc.user_id
      LEFT JOIN expense_categories ec
        ON ec.id = ccpc.expense_category_id
       AND ec.user_id = cc.user_id
      LEFT JOIN LATERAL (
        SELECT
          ccb.id,
          ccb.bill_generation_date,
          ccb.bill_due_date,
          ccb.bill_pdf_url,
          ccb.is_bill_paid,
          ccb.bill_payment_date
        FROM credit_card_bills ccb
        WHERE ccb.user_id = cc.user_id
          AND ccb.credit_card_id = cc.id
        ORDER BY ccb.bill_generation_date DESC
        LIMIT 1
      ) lb ON TRUE
      WHERE cc.user_id = $1 AND cc.id = $2
      GROUP BY
        cc.id,
        lb.id,
        lb.bill_generation_date,
        lb.bill_due_date,
        lb.bill_pdf_url,
        lb.is_bill_paid,
        lb.bill_payment_date
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
  const normalizedCategories = normalizePreferredCategories(
    input.preferredCategories,
  );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `
        INSERT INTO credit_cards (
          user_id,
          name,
          description,
          max_balance,
          used_balance,
          locked_balance,
          bill_generation_day,
          bill_due_day
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id
      `,
      [
        input.userId,
        input.name,
        input.description,
        input.maxBalance,
        input.usedBalance,
        input.lockedBalance,
        input.billGenerationDay,
        input.billDueDay,
      ],
    );
    await syncPreferredCategoryMappings(
      client,
      input.userId,
      rows[0].id,
      normalizedCategories,
    );
    await client.query("COMMIT");

    const card = await getCreditCardById(input.userId, rows[0].id);
    if (!card) {
      throw new Error("Created credit card could not be fetched");
    }
    return card;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateCreditCard(
  input: UpdateCreditCardInput,
): Promise<CreditCardRow | null> {
  const pool = getPool();
  const normalizedCategories =
    input.preferredCategories !== undefined
      ? normalizePreferredCategories(input.preferredCategories)
      : undefined;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rowCount } = await client.query(
      `
        UPDATE credit_cards
        SET
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          max_balance = COALESCE($5, max_balance),
          used_balance = COALESCE($6, used_balance),
          locked_balance = COALESCE($7, locked_balance),
          bill_generation_day = COALESCE($8, bill_generation_day),
          bill_due_day = COALESCE($9, bill_due_day),
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
        input.billGenerationDay ?? null,
        input.billDueDay ?? null,
      ],
    );

    if ((rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    if (normalizedCategories !== undefined) {
      await syncPreferredCategoryMappings(
        client,
        input.userId,
        input.cardId,
        normalizedCategories,
      );
    }
    await client.query("COMMIT");
    return getCreditCardById(input.userId, input.cardId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
