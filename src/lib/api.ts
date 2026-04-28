import { Product } from "../types";
import { getPublicApiUrl } from "./public-api-url";
import { API_UNAVAILABLE, tryFetch } from "./safe-fetch";

const API_URL = getPublicApiUrl();

export async function getProducts(): Promise<Product[]> {
  const response = await tryFetch(`${API_URL}/products`, {
    cache: "no-store",
  });
  if (!response || !response.ok) return [];
  return response.json();
}

export async function getProduct(slug: string): Promise<Product | null> {
  const response = await tryFetch(`${API_URL}/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!response || !response.ok) return null;
  return response.json();
}

export async function sendContact(payload: { name: string; email: string; message: string }) {
  const response = await tryFetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response) return { message: API_UNAVAILABLE };
  return response.json();
}

export type CouponPreviewPayload = {
  code?: string | null;
  items: Array<{ productId: string; quantity: number }>;
};

export type CouponPreviewResult =
  | {
      success: true;
      subtotal: number;
      discount: number;
      total: number;
      couponCode: string | null;
      percentOff?: number;
    }
  | { success: false; message: string };

export async function previewCheckoutCoupon(payload: CouponPreviewPayload): Promise<CouponPreviewResult> {
  const response = await tryFetch(`${API_URL}/checkout/coupon-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response) {
    return { success: false, message: API_UNAVAILABLE };
  }
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return {
      success: false,
      message: typeof data.message === "string" ? data.message : "Could not apply coupon.",
    };
  }
  const subtotal = data.subtotal;
  const discount = data.discount;
  const tot = data.total;
  if (data.valid !== true || typeof subtotal !== "number" || typeof discount !== "number" || typeof tot !== "number") {
    return { success: false, message: "Invalid coupon response." };
  }
  return {
    success: true,
    subtotal,
    discount,
    total: tot,
    couponCode: typeof data.couponCode === "string" ? data.couponCode : null,
    percentOff: typeof data.percentOff === "number" ? data.percentOff : undefined,
  };
}

export type PayramDepositInfo = {
  network: string | null;
  depositWalletLabel: string | null;
  fundSweeper: string | null;
  masterWallet: string | null;
  coldWallet: string | null;
};

export type PaymentOptionsResponse = {
  nowpayments: boolean;
  payram: boolean;
  payramEnvironment: string | null;
  payramDeposit?: PayramDepositInfo | null;
};

/**
 * Loads which gateways the API has keys for (NOWPayments). PayRam options are **always shown** on
 * /checkout so customers can choose them; the API must have `PAYRAM_BASE_URL` + `PAYRAM_API_KEY` to
 * actually open a PayRam link. Set `NEXT_PUBLIC_HIDE_PAYRAM=1` to hide PayRam in the UI.
 */
export async function fetchPaymentOptions(): Promise<PaymentOptionsResponse> {
  const hidePayramUi =
    process.env.NEXT_PUBLIC_HIDE_PAYRAM === "1" || process.env.NEXT_PUBLIC_HIDE_PAYRAM === "true";
  const envBadge = process.env.NEXT_PUBLIC_PAYRAM_ENVIRONMENT?.trim() || null;

  const response = await tryFetch(`${API_URL}/checkout/payment-options`, {
    cache: "no-store",
  });
  let data: PaymentOptionsResponse = { nowpayments: true, payram: true, payramEnvironment: null, payramDeposit: null };
  if (response?.ok) {
    const parsed = (await response.json().catch(() => null)) as PaymentOptionsResponse | null;
    if (parsed && typeof parsed.nowpayments === "boolean") {
      data = { ...data, ...parsed, payram: true };
    }
  }
  return {
    nowpayments: data.nowpayments,
    payram: !hidePayramUi,
    payramEnvironment: data.payramEnvironment ?? envBadge,
    payramDeposit: data.payramDeposit ?? null,
  };
}

export async function checkout(payload: unknown, bearerToken?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }
  const response = await tryFetch(`${API_URL}/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response) {
    return { success: false as const, message: API_UNAVAILABLE };
  }
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok && typeof data.message !== "string") {
    return { success: false as const, message: `Checkout failed (${response.status}).` };
  }
  return data;
}

export type InvoicePreviewResult =
  | {
      ok: true;
      displayLabel: string;
      amount: number;
      currency: string;
      customerName: string | null;
      status: string;
      gateway: string;
    }
  | { ok: false; message: string };

export async function fetchInvoicePreview(token: string): Promise<InvoicePreviewResult> {
  const response = await tryFetch(`${API_URL}/checkout/invoice-preview?token=${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  if (!response) return { ok: false, message: API_UNAVAILABLE };
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return { ok: false, message: typeof data.message === "string" ? data.message : "Invalid payment link." };
  }
  if (
    typeof data.displayLabel !== "string" ||
    typeof data.amount !== "number" ||
    typeof data.currency !== "string" ||
    typeof data.status !== "string" ||
    typeof data.gateway !== "string"
  ) {
    return { ok: false, message: "Invalid response from server." };
  }
  return {
    ok: true,
    displayLabel: data.displayLabel,
    amount: data.amount,
    currency: data.currency,
    customerName: typeof data.customerName === "string" ? data.customerName : null,
    status: data.status,
    gateway: data.gateway,
  };
}

export type InvoicePayResult =
  | { success: true; paymentUrl: string; orderId?: string; emailSent?: boolean }
  | { success: false; message: string };

export async function completeInvoicePayment(token: string): Promise<InvoicePayResult> {
  const response = await tryFetch(`${API_URL}/checkout/invoice-pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response) return { success: false, message: API_UNAVAILABLE };
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return {
      success: false,
      message: typeof data.message === "string" ? data.message : "Could not start payment.",
    };
  }
  if (data.success !== true || typeof data.paymentUrl !== "string" || !data.paymentUrl.trim()) {
    return { success: false, message: "Could not start payment." };
  }
  return {
    success: true,
    paymentUrl: data.paymentUrl.trim(),
    orderId: typeof data.orderId === "string" ? data.orderId : undefined,
    emailSent: typeof data.emailSent === "boolean" ? data.emailSent : undefined,
  };
}
