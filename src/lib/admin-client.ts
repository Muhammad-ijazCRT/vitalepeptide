import { getPublicApiUrl } from "./public-api-url";
import { API_UNAVAILABLE, tryFetch } from "./safe-fetch";

const API = getPublicApiUrl();

function headers(token: string, json = true) {
  const h: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
};

export type AdminStats = {
  totalOrders: number;
  ordersThisMonth: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  todayOrders: number;
  monthlyOrders: number;
  pendingOrders: number;
  newUsersToday: number;
  completedOrdersCount: number;
};

export type AdminOrderRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
  total: number;
  discountAmount: number;
  couponCode: string | null;
  status: string;
  seenByAdmin: boolean;
  userId: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type ProductPayload = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
};

export async function fetchAdminUsers(token: string): Promise<AdminUserRow[] | null> {
  const res = await tryFetch(`${API}/admin/users`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export type AdminUserPaymentLinkRow = {
  id: string;
  displayLabel: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  createdAt: string;
  orderId: string | null;
  customerUrl: string;
};

export type AdminUserLoginEvent = { at: string; ip: string | null; userAgent: string | null };

export type AdminUserDetail = AdminUserRow & {
  orders: AdminOrderRow[];
  paymentLinks: AdminUserPaymentLinkRow[];
  loginHistory: AdminUserLoginEvent[];
};

export async function fetchAdminUserDetail(token: string, id: string): Promise<AdminUserDetail | null> {
  const res = await tryFetch(`${API}/admin/users/${encodeURIComponent(id)}`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function createAdminUser(
  token: string,
  body: { name: string; email: string; password: string; role: "ADMIN" | "CUSTOMER" }
): Promise<AdminUserRow | { message: string }> {
  const res = await tryFetch(`${API}/admin/users`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = (await res.json()) as AdminUserRow | { message?: string };
  if (!res.ok) {
    return { message: typeof (data as { message?: string }).message === "string" ? (data as { message: string }).message : "Create failed" };
  }
  return data as AdminUserRow;
}

export async function updateAdminUser(
  token: string,
  id: string,
  body: { name?: string; email?: string; role?: "ADMIN" | "CUSTOMER"; password?: string }
): Promise<AdminUserRow | { message: string }> {
  const res = await tryFetch(`${API}/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = (await res.json()) as AdminUserRow | { message?: string };
  if (!res.ok) {
    return { message: typeof (data as { message?: string }).message === "string" ? (data as { message: string }).message : "Update failed" };
  }
  return data as AdminUserRow;
}

export async function fetchAdminStats(token: string): Promise<AdminStats | null> {
  const res = await tryFetch(`${API}/admin/stats`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function fetchAdminOrders(token: string): Promise<AdminOrderRow[] | null> {
  const res = await tryFetch(`${API}/admin/orders`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function fetchAdminOrder(token: string, id: string): Promise<AdminOrderRow | null> {
  const res = await tryFetch(`${API}/admin/orders/${encodeURIComponent(id)}`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function patchOrderStatus(token: string, id: string, status: string): Promise<AdminOrderRow | null> {
  const res = await tryFetch(`${API}/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify({ status }),
  });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function fetchNotifCount(token: string): Promise<number> {
  const res = await tryFetch(`${API}/admin/notifications/count`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return 0;
  const j = (await res.json()) as { count?: number };
  return typeof j.count === "number" ? j.count : 0;
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await tryFetch(`${API}/admin/notifications/mark-read`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ all: true }),
  });
}

export async function fetchAdminProducts(token: string): Promise<ProductPayload[] | null> {
  const res = await tryFetch(`${API}/admin/products`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function fetchAdminProduct(token: string, id: string): Promise<ProductPayload | null> {
  const res = await tryFetch(`${API}/admin/products/${encodeURIComponent(id)}`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function createAdminProduct(
  token: string,
  body: Record<string, unknown>
): Promise<ProductPayload | { message: string; issues?: unknown }> {
  const res = await tryFetch(`${API}/admin/products`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = (await res.json()) as ProductPayload | { message?: string };
  if (!res.ok) {
    return { message: typeof (data as { message?: string }).message === "string" ? (data as { message: string }).message : "Create failed" };
  }
  return data as ProductPayload;
}

export async function updateAdminProduct(
  token: string,
  id: string,
  body: Record<string, unknown>
): Promise<ProductPayload | { message: string }> {
  const res = await tryFetch(`${API}/admin/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = (await res.json()) as ProductPayload | { message?: string };
  if (!res.ok) {
    return { message: typeof (data as { message?: string }).message === "string" ? (data as { message: string }).message : "Update failed" };
  }
  return data as ProductPayload;
}

export async function deleteAdminProduct(token: string, id: string): Promise<boolean> {
  const res = await tryFetch(`${API}/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(token, false),
  });
  return Boolean(res?.ok);
}

export type CustomerOrderRow = {
  id: string;
  fullName: string;
  email: string;
  total: number;
  discountAmount: number;
  couponCode: string | null;
  status: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; productSlug: string; quantity: number; unitPrice: number }>;
};

export async function fetchCustomerOrders(token: string): Promise<CustomerOrderRow[] | null> {
  const res = await tryFetch(`${API}/customer/orders`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export type AdminSettingsDTO = {
  mail: {
    smtpHost: string | null;
    smtpPort: number | null;
    smtpSecure: boolean;
    smtpUser: string | null;
    smtpPassSet: boolean;
    mailFrom: string | null;
    adminNotifyEmail: string | null;
  };
  nowpayments: {
    environment: "sandbox" | "live" | null;
    apiKeySet: boolean;
    /** Saved NOWPayments API key (admin GET only). */
    apiKey: string | null;
    publicKey: string | null;
  };
};

export async function fetchAdminSettings(token: string): Promise<AdminSettingsDTO | null> {
  const res = await tryFetch(`${API}/admin/settings`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function updateAdminSettings(
  token: string,
  body: Record<string, unknown>
): Promise<AdminSettingsDTO | { message: string }> {
  const res = await tryFetch(`${API}/admin/settings`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = await res.json();
  if (!res.ok) return { message: typeof data.message === "string" ? data.message : "Save failed" };
  return data as AdminSettingsDTO;
}

export type { AdminCouponRow, AdminCouponsDashboard } from "./admin-coupons-client";
export { createAdminCoupon, fetchAdminCouponsDashboard, patchAdminCoupon } from "./admin-coupons-client";
