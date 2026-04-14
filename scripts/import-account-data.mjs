#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";
import { Pool } from "pg";

function parseFilePathArg(argv) {
  const fileFlagIndex = argv.findIndex((arg) => arg === "--file");
  if (fileFlagIndex !== -1) {
    return argv[fileFlagIndex + 1] ?? "";
  }

  const fileEqualsArg = argv.find((arg) => arg.startsWith("--file="));
  if (fileEqualsArg) {
    return fileEqualsArg.slice("--file=".length);
  }

  return "";
}

async function main() {
  const filePath = parseFilePathArg(process.argv.slice(2));
  if (!filePath) {
    console.error(
      "Usage: npm run import:account-data -- --file=/path/to/export.json",
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const content = await readFile(filePath, "utf8");
  const data = JSON.parse(content);
  if (data?.schemaVersion !== 1) {
    throw new Error("Unsupported export schemaVersion");
  }
  if (!data?.user?.id || !data?.user?.email || !data?.user?.passwordHash) {
    throw new Error("Export file is missing required user fields");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO users (id, email, password_hash, is_approved, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz)
       ON CONFLICT (id)
       DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         is_approved = EXCLUDED.is_approved,
         updated_at = EXCLUDED.updated_at`,
      [
        data.user.id,
        String(data.user.email).toLowerCase(),
        data.user.passwordHash,
        Boolean(data.user.isApproved),
        data.user.createdAt,
        data.user.updatedAt,
      ],
    );

    if (data.userProfile) {
      await client.query(
        `INSERT INTO user_profiles (user_id, name, preferred_currency, created_at, updated_at)
         VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz)
         ON CONFLICT (user_id)
         DO UPDATE SET
           name = EXCLUDED.name,
           preferred_currency = EXCLUDED.preferred_currency,
           updated_at = EXCLUDED.updated_at`,
        [
          data.userProfile.user_id,
          data.userProfile.name,
          data.userProfile.preferred_currency,
          data.userProfile.created_at,
          data.userProfile.updated_at,
        ],
      );
    }

    for (const account of data.bankAccounts ?? []) {
      await client.query(
        `INSERT INTO bank_accounts (
           id, user_id, name, description, account_type, initial_balance, balance,
           last_debit_at, last_credit_at, created_at, updated_at
         )
         VALUES (
           $1, $2, $3, $4, $5::bank_account_type, $6::numeric, $7::numeric,
           $8::timestamptz, $9::timestamptz, $10::timestamptz, $11::timestamptz
         )
         ON CONFLICT (id)
         DO UPDATE SET
           user_id = EXCLUDED.user_id,
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           account_type = EXCLUDED.account_type,
           initial_balance = EXCLUDED.initial_balance,
           balance = EXCLUDED.balance,
           last_debit_at = EXCLUDED.last_debit_at,
           last_credit_at = EXCLUDED.last_credit_at,
           updated_at = EXCLUDED.updated_at`,
        [
          account.id,
          account.user_id,
          account.name,
          account.description,
          account.account_type,
          account.initial_balance,
          account.balance,
          account.last_debit_at,
          account.last_credit_at,
          account.created_at,
          account.updated_at,
        ],
      );
    }

    for (const bucket of data.bankAccountBuckets ?? []) {
      await client.query(
        `INSERT INTO bank_account_buckets (
           id, bank_account_id, user_id, name, allocated_amount, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5::numeric, $6::timestamptz, $7::timestamptz)
         ON CONFLICT (id)
         DO UPDATE SET
           bank_account_id = EXCLUDED.bank_account_id,
           user_id = EXCLUDED.user_id,
           name = EXCLUDED.name,
           allocated_amount = EXCLUDED.allocated_amount,
           updated_at = EXCLUDED.updated_at`,
        [
          bucket.id,
          bucket.bank_account_id,
          bucket.user_id,
          bucket.name,
          bucket.allocated_amount,
          bucket.created_at,
          bucket.updated_at,
        ],
      );
    }

    for (const card of data.creditCards ?? []) {
      await client.query(
        `INSERT INTO credit_cards (
           id, user_id, name, description, max_balance, used_balance, locked_balance,
           preferred_categories, bill_generation_day, bill_due_day,
           previous_bill_cycle_label, previous_bill_pdf_url, previous_bill_paid,
           created_at, updated_at
         )
         VALUES (
           $1, $2, $3, $4, $5::numeric, $6::numeric, $7::numeric, $8::text[],
           $9, $10, $11, $12, $13, $14::timestamptz, $15::timestamptz
         )
         ON CONFLICT (id)
         DO UPDATE SET
           user_id = EXCLUDED.user_id,
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           max_balance = EXCLUDED.max_balance,
           used_balance = EXCLUDED.used_balance,
           locked_balance = EXCLUDED.locked_balance,
           preferred_categories = EXCLUDED.preferred_categories,
           bill_generation_day = EXCLUDED.bill_generation_day,
           bill_due_day = EXCLUDED.bill_due_day,
           previous_bill_cycle_label = EXCLUDED.previous_bill_cycle_label,
           previous_bill_pdf_url = EXCLUDED.previous_bill_pdf_url,
           previous_bill_paid = EXCLUDED.previous_bill_paid,
           updated_at = EXCLUDED.updated_at`,
        [
          card.id,
          card.user_id,
          card.name,
          card.description,
          card.max_balance,
          card.used_balance,
          card.locked_balance,
          card.preferred_categories ?? [],
          card.bill_generation_day,
          card.bill_due_day,
          card.previous_bill_cycle_label,
          card.previous_bill_pdf_url,
          card.previous_bill_paid,
          card.created_at,
          card.updated_at,
        ],
      );
    }

    for (const category of data.expenseCategories ?? []) {
      await client.query(
        `INSERT INTO expense_categories (
           id, user_id, name, description, icon_url, color, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz)
         ON CONFLICT (id)
         DO UPDATE SET
           user_id = EXCLUDED.user_id,
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           icon_url = EXCLUDED.icon_url,
           color = EXCLUDED.color,
           updated_at = EXCLUDED.updated_at`,
        [
          category.id,
          category.user_id,
          category.name,
          category.description,
          category.icon_url,
          category.color,
          category.created_at,
          category.updated_at,
        ],
      );
    }

    for (const card of data.creditCards ?? []) {
      await client.query(
        `DELETE FROM credit_card_preferred_categories
         WHERE user_id = $1 AND credit_card_id = $2`,
        [card.user_id, card.id],
      );

      const preferredCategories = card.preferred_categories ?? [];
      if (preferredCategories.length === 0) continue;

      await client.query(
        `INSERT INTO credit_card_preferred_categories (
           credit_card_id,
           expense_category_id,
           user_id
         )
         SELECT
           $1::uuid,
           ec.id,
           $2::uuid
         FROM expense_categories ec
         WHERE ec.user_id = $2::uuid
           AND ec.name = ANY($3::text[])
         ON CONFLICT (credit_card_id, expense_category_id) DO NOTHING`,
        [card.id, card.user_id, preferredCategories],
      );
    }

    await client.query("COMMIT");
    console.log(`Imported account data for user ${data.user.id}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
