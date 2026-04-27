import { getPublicApiUrl } from "./public-api-url";
import { API_UNAVAILABLE, tryFetch } from "./safe-fetch";

const API = getPublicApiUrl();

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  /** Relative path on API, e.g. `/uploads/avatars/…` */
  avatarUrl?: string | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export async function apiSignup(body: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CUSTOMER";
}): Promise<{ ok: true; data: AuthResponse } | { ok: false; message: string; status: number }> {
  const res = await tryFetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res) return { ok: false, message: API_UNAVAILABLE, status: 0 };
  const data = (await res.json().catch(() => ({}))) as AuthResponse & { message?: string };
  if (!res.ok) {
    return { ok: false, message: data.message ?? "Signup failed", status: res.status };
  }
  return { ok: true, data: data as AuthResponse };
}

export async function apiLogin(body: {
  email: string;
  password: string;
}): Promise<{ ok: true; data: AuthResponse } | { ok: false; message: string; status: number }> {
  const res = await tryFetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res) return { ok: false, message: API_UNAVAILABLE, status: 0 };
  const data = (await res.json().catch(() => ({}))) as AuthResponse & { message?: string };
  if (!res.ok) {
    return { ok: false, message: data.message ?? "Login failed", status: res.status };
  }
  return { ok: true, data: data as AuthResponse };
}

export async function apiMe(token: string): Promise<AuthUser | null> {
  const res = await tryFetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res || !res.ok) return null;
  const json = (await res.json()) as { user: AuthUser };
  return json.user ?? null;
}

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function apiUpdateProfile(
  token: string,
  body: UpdateProfilePayload
): Promise<{ ok: true; user: AuthUser; token: string } | { ok: false; message: string; status: number }> {
  const res = await tryFetch(`${API}/auth/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res) return { ok: false, message: API_UNAVAILABLE, status: 0 };
  const data = (await res.json().catch(() => ({}))) as AuthResponse & { message?: string };
  if (!res.ok) {
    return { ok: false, message: typeof data.message === "string" ? data.message : "Could not update profile.", status: res.status };
  }
  return { ok: true, user: data.user, token: data.token };
}

export async function apiUploadAvatar(
  token: string,
  file: File
): Promise<{ ok: true; user: AuthUser; token: string } | { ok: false; message: string; status: number }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await tryFetch(`${API}/auth/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res) return { ok: false, message: API_UNAVAILABLE, status: 0 };
  const data = (await res.json().catch(() => ({}))) as AuthResponse & { message?: string };
  if (!res.ok) {
    return { ok: false, message: typeof data.message === "string" ? data.message : "Could not upload image.", status: res.status };
  }
  return { ok: true, user: data.user, token: data.token };
}

export async function apiDeleteAvatar(
  token: string
): Promise<{ ok: true; user: AuthUser; token: string } | { ok: false; message: string; status: number }> {
  const res = await tryFetch(`${API}/auth/me/avatar`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res) return { ok: false, message: API_UNAVAILABLE, status: 0 };
  const data = (await res.json().catch(() => ({}))) as AuthResponse & { message?: string };
  if (!res.ok) {
    return { ok: false, message: typeof data.message === "string" ? data.message : "Could not remove photo.", status: res.status };
  }
  return { ok: true, user: data.user, token: data.token };
}
