import { getApiRoute } from "@/configs/api-routes";

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
  email: string;
  password: string;
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
