import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { getSession } from "@/lib/auth/session";
import { findUserById, normalizeEmail } from "@/lib/auth/user";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

type UserProfileRow = {
  user_id: string;
  name: string;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
};

type BankAccountRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  account_type: string;
  initial_balance: string;
  balance: string;
  preferred_categories: string[];
  last_debit_at: string | null;
  last_credit_at: string | null;
  created_at: string;
  updated_at: string;
};

type BankAccountBucketRow = {
  id: string;
  bank_account_id: string;
  user_id: string;
  name: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
};

type CreditCardRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  max_balance: string;
  used_balance: string;
  locked_balance: string;
  preferred_categories: string[];
  bill_generation_day: number;
  bill_due_day: number;
  created_at: string;
  updated_at: string;
};

type CreditCardBillRow = {
  id: string;
  user_id: string;
  credit_card_id: string;
  bill_generation_date: string;
  bill_due_date: string;
  bill_pdf_url: string | null;
  is_bill_paid: boolean;
  bill_payment_date: string | null;
  created_at: string;
  updated_at: string;
};

type ExpenseCategoryRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon_url: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query<{
      id: string;
      email: string;
      password_hash: string;
      is_approved: boolean;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, email, password_hash, is_approved, created_at::text, updated_at::text
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [user.id],
    );
    const profileResult = await client.query<UserProfileRow>(
      `SELECT user_id, name, preferred_currency, created_at::text, updated_at::text
       FROM user_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [user.id],
    );
    const bankAccountsResult = await client.query<BankAccountRow>(
      `SELECT
              ba.id,
              ba.user_id,
              ba.name,
              ba.description,
              ba.account_type::text,
              ba.initial_balance::text,
              ba.balance::text,
              COALESCE(
                array_agg(ec.name ORDER BY ec.name) FILTER (WHERE ec.name IS NOT NULL),
                '{}'
              ) AS preferred_categories,
              ba.last_debit_at::text,
              ba.last_credit_at::text,
              ba.created_at::text,
              ba.updated_at::text
       FROM bank_accounts ba
       LEFT JOIN bank_account_preferred_categories bapc
         ON bapc.bank_account_id = ba.id
        AND bapc.user_id = ba.user_id
       LEFT JOIN expense_categories ec
         ON ec.id = bapc.expense_category_id
        AND ec.user_id = ba.user_id
       WHERE ba.user_id = $1
       GROUP BY ba.id
       ORDER BY ba.created_at ASC`,
      [user.id],
    );
    const bankAccountBucketsResult = await client.query<BankAccountBucketRow>(
      `SELECT id, bank_account_id, user_id, name, allocated_amount::text,
              created_at::text, updated_at::text
       FROM bank_account_buckets
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [user.id],
    );
    const creditCardsResult = await client.query<CreditCardRow>(
      `SELECT
         cc.id,
         cc.user_id,
         cc.name,
         cc.description,
         cc.max_balance::text,
         cc.used_balance::text,
         cc.locked_balance::text,
         COALESCE(
           array_agg(ec.name ORDER BY ec.name) FILTER (WHERE ec.name IS NOT NULL),
           '{}'
         ) AS preferred_categories,
         cc.bill_generation_day,
         cc.bill_due_day,
         cc.created_at::text,
         cc.updated_at::text
       FROM credit_cards cc
       LEFT JOIN credit_card_preferred_categories ccpc
         ON ccpc.credit_card_id = cc.id
        AND ccpc.user_id = cc.user_id
       LEFT JOIN expense_categories ec
         ON ec.id = ccpc.expense_category_id
        AND ec.user_id = cc.user_id
       WHERE cc.user_id = $1
       GROUP BY cc.id
       ORDER BY cc.created_at ASC`,
      [user.id],
    );
    const creditCardBillsResult = await client.query<CreditCardBillRow>(
      `SELECT id, user_id, credit_card_id, bill_generation_date::text, bill_due_date::text,
              bill_pdf_url, is_bill_paid, bill_payment_date::text,
              created_at::text, updated_at::text
       FROM credit_card_bills
       WHERE user_id = $1
       ORDER BY bill_generation_date ASC`,
      [user.id],
    );
    const expenseCategoriesResult = await client.query<ExpenseCategoryRow>(
      `SELECT id, user_id, name, description, icon_url, color,
              created_at::text, updated_at::text
       FROM expense_categories
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [user.id],
    );

    await client.query("COMMIT");

    const exportedUser = userResult.rows[0];
    if (!exportedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      user: {
        id: exportedUser.id,
        email: normalizeEmail(exportedUser.email),
        passwordHash: exportedUser.password_hash,
        isApproved: exportedUser.is_approved,
        createdAt: exportedUser.created_at,
        updatedAt: exportedUser.updated_at,
      },
      userProfile: profileResult.rows[0] ?? null,
      bankAccounts: bankAccountsResult.rows,
      bankAccountBuckets: bankAccountBucketsResult.rows,
      creditCards: creditCardsResult.rows,
      creditCardBills: creditCardBillsResult.rows,
      expenseCategories: expenseCategoriesResult.rows,
    };

    const filenameDate = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="fintrack-export-${filenameDate}.json"`,
      },
    });
  } catch {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: "Could not export account data" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  await pool.query("DELETE FROM users WHERE id = $1", [session.sub]);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
