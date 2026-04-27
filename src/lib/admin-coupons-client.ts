import { getPublicApiUrl } from "./public-api-url";
import { API_UNAVAILABLE, tryFetch } from "./safe-fetch";

const API = getPublicApiUrl();

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as const;
}

export type AdminCouponRow = {
  id: string;
  code: string;
  percentOff: number;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  createdAt: string;
};

export type AdminCouponsDashboard = {
  coupons: AdminCouponRow[];
  stats: {
    lifetimeDiscount: number;
    ordersWithCouponCount: number;
    activeCodes: number;
    inactiveCodes: number;
    totalCodes: number;
  };
  performance: Array<{ code: string; uses: number; totalDiscount: number }>;
  recentCheckouts: Array<{
    orderId: string;
    email: string;
    fullName: string;
    couponCode: string | null;
    discountAmount: number;
    total: number;
    createdAt: string;
  }>;
};

export async function fetchAdminCouponsDashboard(token: string): Promise<AdminCouponsDashboard | null> {
  const res = await tryFetch(`${API}/admin/coupons/dashboard`, { headers: headers(token), cache: "no-store" });
  if (!res || !res.ok) return null;
  return res.json();
}

export async function createAdminCoupon(
  token: string,
  body: { code: string; percentOff: number; maxUses: number | null }
): Promise<AdminCouponRow | { message: string }> {
  const res = await tryFetch(`${API}/admin/coupons`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = await res.json();
  if (!res.ok) return { message: typeof data.message === "string" ? data.message : "Create failed" };
  return data as AdminCouponRow;
}

export async function patchAdminCoupon(
  token: string,
  id: string,
  body: { isActive: boolean }
): Promise<AdminCouponRow | { message: string }> {
  const res = await tryFetch(`${API}/admin/coupons/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res) return { message: API_UNAVAILABLE };
  const data = await res.json();
  if (!res.ok) return { message: typeof data.message === "string" ? data.message : "Update failed" };
  return data as AdminCouponRow;
}
