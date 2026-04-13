import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { SignJWT, jwtVerify } from "jose";

import { getJwtSecret } from "./jwt";

import { OTP_LENGTH, OTP_TTL_MS } from "./constants";

export type OtpPurpose = "password_reset" | "password_change";

const OTP_BCRYPT_ROUNDS = 10;

function generateNumericOtp(): string {
  const n = randomInt(0, 10 ** OTP_LENGTH);
  return String(n).padStart(OTP_LENGTH, "0");
}

export type IssueOtpTicketResult = {
  /** Logged to console in dev only; never stored server-side. */
  otp: string;
  /** Signed JWT: sub, purpose, bcrypt hash of OTP (`oh`), optional `em` (normalized email). */
  otpToken: string;
  expiresAt: string;
};

/**
 * Builds a stateless OTP ticket. The client must send `otpToken` + `otp` (+ binding fields) back to verify.
 * Plaintext OTP is only returned for logging in development.
 */
export async function issueOtpTicket(
  userId: string,
  purpose: OtpPurpose,
  options?: { emailNorm?: string },
): Promise<IssueOtpTicketResult> {
  const otp = generateNumericOtp();
  const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const claims: Record<string, unknown> = {
    purpose,
    oh: otpHash,
  };
  if (options?.emailNorm !== undefined) {
    claims.em = options.emailNorm;
  }

  const otpToken = await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(OTP_TTL_MS / 1000)}s`)
    .sign(getJwtSecret());

  return {
    otp,
    otpToken,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Verifies JWT signature, expiry, purpose, optional email binding, and that `otp` matches the embedded bcrypt hash.
 */
export async function verifyOtpTicket(
  otpToken: string,
  otp: string,
  purpose: OtpPurpose,
  options?: { emailNorm?: string },
): Promise<{ sub: string } | null> {
  const trimmed = otp.trim();
  try {
    const { payload } = await jwtVerify(otpToken, getJwtSecret());
    if (payload.purpose !== purpose) return null;
    const sub = payload.sub;
    const oh = payload.oh;
    if (typeof sub !== "string" || typeof oh !== "string") return null;
    if (options?.emailNorm !== undefined) {
      if (payload.em !== options.emailNorm) return null;
    }
    const ok = await bcrypt.compare(trimmed, oh);
    if (!ok) return null;
    return { sub };
  } catch {
    return null;
  }
}
