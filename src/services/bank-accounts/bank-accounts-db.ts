import { getPool } from "@/lib/db";
import type {
  BankAccountRow,
  BankAccountType,
} from "@/lib/bank-accounts/types";
import type { PoolClient } from "pg";

type BankAccountDbRow = {
  id: string;
  name: string;
  description: string;
  account_type: BankAccountType;
  balance: string | number;
  bucket_names: string[] | null;
  preferred_categories: string[] | null;
};

export type CreateBankAccountInput = {
  userId: string;
  name: string;
  description: string;
  accountType: BankAccountType;
  initialBalance: number;
  lastDebitAt?: string | null;
  lastCreditAt?: string | null;
  buckets?: string[];
  preferredCategories?: string[];
};

export type UpdateBankAccountInput = {
  userId: string;
  accountId: string;
  name?: string;
  description?: string;
  accountType?: BankAccountType;
  balance?: number;
  lastDebitAt?: string | null;
  lastCreditAt?: string | null;
  buckets?: string[];
  preferredCategories?: string[];
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
  accountId: string,
  preferredCategories: string[],
): Promise<void> {
  const categoryIds = await resolvePreferredCategoryIds(
    client,
    userId,
    preferredCategories,
  );

  await client.query(
    `
      DELETE FROM bank_account_preferred_categories
      WHERE user_id = $1 AND bank_account_id = $2
    `,
    [userId, accountId],
  );

  if (categoryIds.length === 0) {
    return;
  }

  await client.query(
    `
      INSERT INTO bank_account_preferred_categories (
        bank_account_id,
        expense_category_id,
        user_id
      )
      SELECT $1, ids.category_id, $2
      FROM unnest($3::uuid[]) AS ids(category_id)
      ON CONFLICT (bank_account_id, expense_category_id) DO NOTHING
    `,
    [accountId, userId, categoryIds],
  );
}

function mapRow(row: BankAccountDbRow): BankAccountRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    accountType: row.account_type,
    balance: toNumber(row.balance),
    creditsThisMonth: 0,
    debitsThisMonth: 0,
    bucketNames: row.bucket_names ?? [],
    preferredCategories: row.preferred_categories ?? [],
  };
}

export async function listBankAccounts(
  userId: string,
): Promise<BankAccountRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<BankAccountDbRow>(
    `
      SELECT
        ba.id,
        ba.name,
        ba.description,
        ba.account_type,
        ba.balance,
        COALESCE(
          ARRAY_AGG(DISTINCT bab.name ORDER BY bab.name) FILTER (
            WHERE bab.id IS NOT NULL
          ),
          '{}'
        ) AS bucket_names,
        COALESCE(
          ARRAY_AGG(DISTINCT ec.name ORDER BY ec.name) FILTER (
            WHERE ec.name IS NOT NULL
          ),
          '{}'
        ) AS preferred_categories
      FROM bank_accounts ba
      LEFT JOIN bank_account_buckets bab
        ON bab.bank_account_id = ba.id
       AND bab.user_id = ba.user_id
      LEFT JOIN bank_account_preferred_categories bapc
        ON bapc.bank_account_id = ba.id
       AND bapc.user_id = ba.user_id
      LEFT JOIN expense_categories ec
        ON ec.id = bapc.expense_category_id
       AND ec.user_id = ba.user_id
      WHERE ba.user_id = $1
      GROUP BY ba.id
      ORDER BY ba.created_at DESC
    `,
    [userId],
  );

  return rows.map(mapRow);
}

export async function getBankAccountById(
  userId: string,
  accountId: string,
): Promise<BankAccountRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<BankAccountDbRow>(
    `
      SELECT
        ba.id,
        ba.name,
        ba.description,
        ba.account_type,
        ba.balance,
        COALESCE(
          ARRAY_AGG(DISTINCT bab.name ORDER BY bab.name) FILTER (
            WHERE bab.id IS NOT NULL
          ),
          '{}'
        ) AS bucket_names,
        COALESCE(
          ARRAY_AGG(DISTINCT ec.name ORDER BY ec.name) FILTER (
            WHERE ec.name IS NOT NULL
          ),
          '{}'
        ) AS preferred_categories
      FROM bank_accounts ba
      LEFT JOIN bank_account_buckets bab
        ON bab.bank_account_id = ba.id
       AND bab.user_id = ba.user_id
      LEFT JOIN bank_account_preferred_categories bapc
        ON bapc.bank_account_id = ba.id
       AND bapc.user_id = ba.user_id
      LEFT JOIN expense_categories ec
        ON ec.id = bapc.expense_category_id
       AND ec.user_id = ba.user_id
      WHERE ba.user_id = $1 AND ba.id = $2
      GROUP BY ba.id
      LIMIT 1
    `,
    [userId, accountId],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createBankAccount(
  input: CreateBankAccountInput,
): Promise<BankAccountRow> {
  const pool = getPool();
  const normalizedPreferredCategories = normalizePreferredCategories(
    input.preferredCategories ?? [],
  );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `
        INSERT INTO bank_accounts (
          user_id, name, description, account_type, initial_balance, balance, last_debit_at, last_credit_at
        )
        VALUES ($1,$2,$3,$4,$5,$5,$6,$7)
        RETURNING id
      `,
      [
        input.userId,
        input.name,
        input.description,
        input.accountType,
        input.initialBalance,
        input.lastDebitAt ?? null,
        input.lastCreditAt ?? null,
      ],
    );
    const accountId = rows[0].id;

    if (input.buckets && input.buckets.length > 0) {
      for (const bucketName of input.buckets) {
        await client.query(
          `
            INSERT INTO bank_account_buckets (bank_account_id, user_id, name)
            VALUES ($1,$2,$3)
            ON CONFLICT (bank_account_id, name)
            DO NOTHING
          `,
          [accountId, input.userId, bucketName],
        );
      }
    }

    await syncPreferredCategoryMappings(
      client,
      input.userId,
      accountId,
      normalizedPreferredCategories,
    );

    await client.query("COMMIT");
    const account = await getBankAccountById(input.userId, accountId);
    if (!account) throw new Error("Created account could not be fetched");
    return account;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateBankAccount(
  input: UpdateBankAccountInput,
): Promise<BankAccountRow | null> {
  const pool = getPool();
  const normalizedPreferredCategories =
    input.preferredCategories !== undefined
      ? normalizePreferredCategories(input.preferredCategories)
      : undefined;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (
      input.name !== undefined ||
      input.description !== undefined ||
      input.accountType !== undefined ||
      input.balance !== undefined ||
      input.lastDebitAt !== undefined ||
      input.lastCreditAt !== undefined
    ) {
      await client.query(
        `
          UPDATE bank_accounts
          SET
            name = COALESCE($3, name),
            description = COALESCE($4, description),
            account_type = COALESCE($5, account_type),
            balance = COALESCE($6, balance),
            last_debit_at = COALESCE($7, last_debit_at),
            last_credit_at = COALESCE($8, last_credit_at),
            updated_at = NOW()
          WHERE user_id = $1 AND id = $2
        `,
        [
          input.userId,
          input.accountId,
          input.name ?? null,
          input.description ?? null,
          input.accountType ?? null,
          input.balance ?? null,
          input.lastDebitAt ?? null,
          input.lastCreditAt ?? null,
        ],
      );
    }

    if (input.buckets) {
      await client.query(
        `DELETE FROM bank_account_buckets WHERE bank_account_id = $1 AND user_id = $2`,
        [input.accountId, input.userId],
      );
      for (const bucketName of input.buckets) {
        await client.query(
          `
            INSERT INTO bank_account_buckets (bank_account_id, user_id, name)
            VALUES ($1,$2,$3)
            ON CONFLICT (bank_account_id, name)
            DO NOTHING
          `,
          [input.accountId, input.userId, bucketName],
        );
      }
    }

    if (normalizedPreferredCategories !== undefined) {
      await syncPreferredCategoryMappings(
        client,
        input.userId,
        input.accountId,
        normalizedPreferredCategories,
      );
    }

    await client.query("COMMIT");
    return getBankAccountById(input.userId, input.accountId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteBankAccount(
  userId: string,
  accountId: string,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `DELETE FROM bank_accounts WHERE user_id = $1 AND id = $2`,
    [userId, accountId],
  );
  return (result.rowCount ?? 0) > 0;
}
