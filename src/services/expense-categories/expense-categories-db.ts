import { getPool } from "@/lib/db";
import type {
  CatppuccinMochaColor,
  ExpenseCategoryRow,
} from "@/lib/expense-categories/types";

type ExpenseCategoryDbRow = {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  color: CatppuccinMochaColor;
};

export type CreateExpenseCategoryInput = {
  userId: string;
  name: string;
  description: string;
  iconUrl: string;
  color: CatppuccinMochaColor;
};

export type UpdateExpenseCategoryInput = {
  userId: string;
  categoryId: string;
  name?: string;
  description?: string;
  iconUrl?: string;
  color?: CatppuccinMochaColor;
};

function mapRow(row: ExpenseCategoryDbRow): ExpenseCategoryRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    iconUrl: row.icon_url,
    color: row.color,
  };
}

export async function listExpenseCategories(
  userId: string,
): Promise<ExpenseCategoryRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<ExpenseCategoryDbRow>(
    `
      SELECT id, name, description, icon_url, color
      FROM expense_categories
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );
  return rows.map(mapRow);
}

export async function getExpenseCategoryById(
  userId: string,
  categoryId: string,
): Promise<ExpenseCategoryRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<ExpenseCategoryDbRow>(
    `
      SELECT id, name, description, icon_url, color
      FROM expense_categories
      WHERE user_id = $1 AND id = $2
      LIMIT 1
    `,
    [userId, categoryId],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createExpenseCategory(
  input: CreateExpenseCategoryInput,
): Promise<ExpenseCategoryRow> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: string }>(
    `
      INSERT INTO expense_categories (user_id, name, description, icon_url, color)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id
    `,
    [input.userId, input.name, input.description, input.iconUrl, input.color],
  );
  const category = await getExpenseCategoryById(input.userId, rows[0].id);
  if (!category)
    throw new Error("Created expense category could not be fetched");
  return category;
}

export async function updateExpenseCategory(
  input: UpdateExpenseCategoryInput,
): Promise<ExpenseCategoryRow | null> {
  const pool = getPool();
  const { rowCount } = await pool.query(
    `
      UPDATE expense_categories
      SET
        name = COALESCE($3, name),
        description = COALESCE($4, description),
        icon_url = COALESCE($5, icon_url),
        color = COALESCE($6, color),
        updated_at = NOW()
      WHERE user_id = $1 AND id = $2
    `,
    [
      input.userId,
      input.categoryId,
      input.name ?? null,
      input.description ?? null,
      input.iconUrl ?? null,
      input.color ?? null,
    ],
  );
  if ((rowCount ?? 0) === 0) return null;
  return getExpenseCategoryById(input.userId, input.categoryId);
}

export async function deleteExpenseCategory(
  userId: string,
  categoryId: string,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `DELETE FROM expense_categories WHERE user_id = $1 AND id = $2`,
    [userId, categoryId],
  );
  return (result.rowCount ?? 0) > 0;
}
