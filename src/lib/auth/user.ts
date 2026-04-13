import { getPool } from "@/lib/db";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const n = normalizeEmail(email);
  if (!EMAIL_RE.test(n)) return "Invalid email address";
  return null;
}

export function validateOtp(otp: string): string | null {
  if (!/^\d{6}$/.test(otp.trim())) {
    return "OTP must be 6 digits";
  }
  return null;
}

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  is_approved: boolean;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const e = normalizeEmail(email);
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, password_hash, is_approved
     FROM users WHERE lower(email) = $1 LIMIT 1`,
    [e],
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, password_hash, is_approved FROM users WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}
