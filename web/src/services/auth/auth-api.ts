import { getApiRoute } from "@/configs/api-routes";
import type { SupportedCurrency } from "@/lib/user-profile";

export type ApiErrorBody = {
  error?: string;
  message?: string;
};

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T;
}

export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const res = await fetch(getApiRoute("authLogin"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await readJson<ApiErrorBody>(res);
  if (!res.ok) throw new Error(body.error ?? "Could not sign in");
  return body;
}

export async function signupRequest(payload: {
  name: string;
  email: string;
  password: string;
  preferredCurrency: SupportedCurrency;
}) {
  const res = await fetch(getApiRoute("authSignup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readJson<ApiErrorBody>(res);
  if (!res.ok) throw new Error(body.error ?? "Could not create account");
  return body;
}

export type AuthUser = {
  id: string;
  email: string;
  isApproved: boolean;
  name: string;
  preferredCurrency: SupportedCurrency;
};

export async function getCurrentUserRequest() {
  const res = await fetch(getApiRoute("authMe"), {
    method: "GET",
    credentials: "include",
  });
  const body = await readJson<{ user?: AuthUser } & ApiErrorBody>(res);
  if (res.status === 401) return { user: null };
  if (!res.ok) throw new Error(body.error ?? "Could not load user profile");
  return { user: body.user ?? null };
}

export async function updateUserProfileRequest(payload: {
  name?: string;
  preferredCurrency?: SupportedCurrency;
}) {
  const res = await fetch(getApiRoute("authMe"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await readJson<{ user?: AuthUser } & ApiErrorBody>(res);
  if (!res.ok) {
    throw new Error(body.error ?? "Could not update profile");
  }
  return body;
}

export type ForgotPasswordResponse = {
  message?: string;
  otpToken?: string;
  expiresAt?: string;
};

export async function forgotPasswordRequest(payload: { email: string }) {
  const res = await fetch(getApiRoute("authForgotPassword"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readJson<ForgotPasswordResponse & ApiErrorBody>(res);
  if (!res.ok) throw new Error(body.error ?? "Something went wrong");
  return body;
}

export async function resetPasswordRequest(payload: {
  email: string;
  otp: string;
  otpToken: string;
  newPassword: string;
}) {
  const res = await fetch(getApiRoute("authResetPassword"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readJson<ApiErrorBody>(res);
  if (!res.ok) throw new Error(body.error ?? "Could not reset password");
  return body;
}

export type RequestChangePasswordOtpResponse = {
  otpToken?: string;
};

export async function requestChangePasswordOtp() {
  const res = await fetch(getApiRoute("authChangePasswordRequestOtp"), {
    method: "POST",
    credentials: "include",
  });
  const body = await readJson<RequestChangePasswordOtpResponse & ApiErrorBody>(
    res,
  );
  if (!res.ok) {
    throw new Error(body.error ?? "Could not send verification code");
  }
  return body;
}

export async function changePasswordRequest(payload: {
  otp: string;
  otpToken: string;
  newPassword: string;
}) {
  const res = await fetch(getApiRoute("authChangePassword"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await readJson<ApiErrorBody>(res);
  if (!res.ok) throw new Error(body.error ?? "Could not change password");
  return body;
}

export async function logoutRequest() {
  await fetch(getApiRoute("authLogout"), {
    method: "POST",
    credentials: "include",
  });
}

export async function exportAccountDataRequest() {
  const res = await fetch(getApiRoute("authAccountData"), {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await readJson<ApiErrorBody>(res);
    throw new Error(body.error ?? "Could not export account data");
  }
  const blob = await res.blob();
  const filename =
    res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ??
    `fintrack-export-${new Date().toISOString().slice(0, 10)}.json`;
  return { blob, filename };
}

export async function deleteAccountRequest() {
  const res = await fetch(getApiRoute("authAccountData"), {
    method: "DELETE",
    credentials: "include",
  });
  const body = await readJson<ApiErrorBody>(res);
  if (!res.ok) {
    throw new Error(body.error ?? "Could not delete account");
  }
  return body;
}
