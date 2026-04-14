import { getPool } from "@/lib/db";
import type {
  BankAccountRow,
  BankAccountType,
} from "@/lib/bank-accounts/types";

type BankAccountDbRow = {
  id: string;
  name: string;
  description: string;
  account_type: BankAccountType;
  balance: string | number;
  bucket_names: string[] | null;
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
};

function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  return Number(value);
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
          ARRAY_AGG(bab.name ORDER BY bab.name) FILTER (WHERE bab.id IS NOT NULL),
          '{}'
        ) AS bucket_names
      FROM bank_accounts ba
      LEFT JOIN bank_account_buckets bab
        ON bab.bank_account_id = ba.id
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
          ARRAY_AGG(bab.name ORDER BY bab.name) FILTER (WHERE bab.id IS NOT NULL),
          '{}'
        ) AS bucket_names
      FROM bank_accounts ba
      LEFT JOIN bank_account_buckets bab
        ON bab.bank_account_id = ba.id
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
