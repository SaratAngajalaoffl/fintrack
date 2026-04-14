import { getPool } from "@/lib/db";
import type {
  FundBucketPriority,
  FundBucketRow,
} from "@/lib/fund-buckets/types";

type FundBucketDbRow = {
  id: string;
  name: string;
  target_amount: string | number;
  bank_account_id: string;
  bank_account_name: string;
  current_value: string | number;
  is_locked: boolean;
  priority: FundBucketPriority;
};

export type CreateFundBucketInput = {
  userId: string;
  name: string;
  targetAmount: number;
  bankAccountId: string;
  priority: FundBucketPriority;
};

function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  return Number(value);
}

function mapRow(row: FundBucketDbRow): FundBucketRow {
  return {
    id: row.id,
    name: row.name,
    targetAmount: toNumber(row.target_amount),
    bankAccountId: row.bank_account_id,
    bankAccountName: row.bank_account_name,
    currentValue: toNumber(row.current_value),
    isLocked: row.is_locked,
    priority: row.priority,
  };
}

export async function listFundBuckets(
  userId: string,
): Promise<FundBucketRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<FundBucketDbRow>(
    `
      SELECT
        fb.id,
        fb.name,
        fb.target_amount,
        fb.bank_account_id,
        ba.name AS bank_account_name,
        fb.current_value,
        fb.is_locked,
        fb.priority
      FROM fund_buckets fb
      INNER JOIN bank_accounts ba
        ON ba.id = fb.bank_account_id
       AND ba.user_id = fb.user_id
      WHERE fb.user_id = $1
      ORDER BY fb.created_at DESC
    `,
    [userId],
  );

  return rows.map(mapRow);
}

export async function createFundBucket(
  input: CreateFundBucketInput,
): Promise<FundBucketRow> {
  const pool = getPool();

  const bankAccount = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM bank_accounts
      WHERE user_id = $1 AND id = $2
      LIMIT 1
    `,
    [input.userId, input.bankAccountId],
  );

  if (!bankAccount.rows[0]) {
    throw new Error("Bank account not found");
  }

  const { rows } = await pool.query<FundBucketDbRow>(
    `
      INSERT INTO fund_buckets (
        user_id,
        name,
        target_amount,
        bank_account_id,
        current_value,
        is_locked,
        priority
      )
      VALUES ($1,$2,$3,$4,0,TRUE,$5)
      RETURNING
        id,
        name,
        target_amount,
        bank_account_id,
        (
          SELECT name
          FROM bank_accounts
          WHERE id = fund_buckets.bank_account_id
        ) AS bank_account_name,
        current_value,
        is_locked,
        priority
    `,
    [
      input.userId,
      input.name,
      input.targetAmount,
      input.bankAccountId,
      input.priority,
    ],
  );

  return mapRow(rows[0]);
}

export async function allocateFundsToBucket(input: {
  userId: string;
  bucketId: string;
  amount: number;
}): Promise<FundBucketRow | null> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bucketResult = await client.query<{
      id: string;
      bank_account_id: string;
      current_value: string | number;
      is_locked: boolean;
    }>(
      `
        SELECT id, bank_account_id, current_value, is_locked
        FROM fund_buckets
        WHERE id = $1 AND user_id = $2
        LIMIT 1
        FOR UPDATE
      `,
      [input.bucketId, input.userId],
    );

    const bucket = bucketResult.rows[0];
    if (!bucket) {
      await client.query("ROLLBACK");
      return null;
    }

    if (!bucket.is_locked) {
      throw new Error("Cannot allocate funds to an unlocked fund bucket");
    }

    const accountResult = await client.query<{ balance: string | number }>(
      `
        SELECT balance
        FROM bank_accounts
        WHERE id = $1 AND user_id = $2
        LIMIT 1
        FOR UPDATE
      `,
      [bucket.bank_account_id, input.userId],
    );

    const account = accountResult.rows[0];
    if (!account) {
      throw new Error("Bank account not found");
    }

    const lockedTotalsResult = await client.query<{
      locked_total: string | number;
    }>(
      `
        SELECT COALESCE(SUM(current_value), 0) AS locked_total
        FROM fund_buckets
        WHERE user_id = $1
          AND bank_account_id = $2
          AND is_locked = TRUE
      `,
      [input.userId, bucket.bank_account_id],
    );

    const balance = toNumber(account.balance);
    const totalLocked = toNumber(lockedTotalsResult.rows[0].locked_total);
    const availableToLock = balance - totalLocked;

    if (input.amount > availableToLock) {
      throw new Error(
        "Insufficient available balance in bank account for this allocation",
      );
    }

    await client.query(
      `
        UPDATE fund_buckets
        SET
          current_value = current_value + $3,
          updated_at = NOW()
        WHERE id = $1 AND user_id = $2
      `,
      [input.bucketId, input.userId, input.amount],
    );

    const result = await client.query<FundBucketDbRow>(
      `
        SELECT
          fb.id,
          fb.name,
          fb.target_amount,
          fb.bank_account_id,
          ba.name AS bank_account_name,
          fb.current_value,
          fb.is_locked,
          fb.priority
        FROM fund_buckets fb
        INNER JOIN bank_accounts ba
          ON ba.id = fb.bank_account_id
         AND ba.user_id = fb.user_id
        WHERE fb.id = $1 AND fb.user_id = $2
        LIMIT 1
      `,
      [input.bucketId, input.userId],
    );

    await client.query("COMMIT");
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function unlockFundBucket(input: {
  userId: string;
  bucketId: string;
}): Promise<FundBucketRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<FundBucketDbRow>(
    `
      UPDATE fund_buckets fb
      SET
        is_locked = FALSE,
        updated_at = NOW()
      FROM bank_accounts ba
      WHERE fb.id = $1
        AND fb.user_id = $2
        AND ba.id = fb.bank_account_id
        AND ba.user_id = fb.user_id
        AND fb.is_locked = TRUE
        AND fb.current_value >= fb.target_amount
      RETURNING
        fb.id,
        fb.name,
        fb.target_amount,
        fb.bank_account_id,
        ba.name AS bank_account_name,
        fb.current_value,
        fb.is_locked,
        fb.priority
    `,
    [input.bucketId, input.userId],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function setFundBucketPriority(input: {
  userId: string;
  bucketId: string;
  priority: FundBucketPriority;
}): Promise<FundBucketRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<FundBucketDbRow>(
    `
      UPDATE fund_buckets fb
      SET
        priority = $3,
        updated_at = NOW()
      FROM bank_accounts ba
      WHERE fb.id = $1
        AND fb.user_id = $2
        AND ba.id = fb.bank_account_id
        AND ba.user_id = fb.user_id
      RETURNING
        fb.id,
        fb.name,
        fb.target_amount,
        fb.bank_account_id,
        ba.name AS bank_account_name,
        fb.current_value,
        fb.is_locked,
        fb.priority
    `,
    [input.bucketId, input.userId, input.priority],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}
