import { getPublicApiUrl } from "./public-api-url";
import { API_UNAVAILABLE, tryFetch } from "./safe-fetch";

const API = getPublicApiUrl();

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as const;
}

export type PaymentInvoiceDashboard = {
  counts: { pending: number; paid: number; all: number };
  recent: Array<{
    id: string;
    token: string;
    displayLabel: string;
    amount: number;
    currency: string;
    customerEmail: string;
    status: string;
    createdAt: string;
    orderId: string | null;
    customerUrl: string;
  }>;
};

export async function fetchPaymentInvoiceDashboard(token: string): Promise<PaymentInvoiceDashboard | null> {
  const res = await tryFetch(`${API}/admin/payment-invoice-links/dashboard`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (!res || !res.ok) return null;
  return res.json();
}

export type PaymentInvoiceHistoryRow = {
  id: string;
  token: string;
  displayLabel: string;
  amount: number;
  currency: string;
  gateway: string;
  customerEmail: string;
  customerName: string | null;
  status: string;
  createdAt: string;
  orderId: string | null;
  customerUrl: string;
  paidAt: string | null;
};

export type PaymentInvoiceHistoryResponse = {
  counts: { pending: number; paid: number; all: number };
  rows: PaymentInvoiceHistoryRow[];
};

export async function fetchPaymentInvoiceHistory(token: string): Promise<PaymentInvoiceHistoryResponse | null> {
  const res = await tryFetch(`${API}/admin/payment-invoice-links/history`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (!res || !res.ok) return null;
  return res.json();
}

export type CreatePaymentInvoiceBody = {
  displayLabel: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string | null;
  memo: string | null;
};

export type CreatePaymentInvoiceResult =
  | { ok: true; customerUrl: string; checkoutPath: string; amount: number; currency: string; emailSent: boolean }
  | { ok: false; message: string };

export async function createPaymentInvoiceLink(
  token: string,
  body: CreatePaymentInvoiceBody
): Promise<CreatePaymentInvoiceResult> {
  const res = await tryFetch(`${API}/admin/payment-invoice-links`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      gateway: "nowpayments",
      displayLabel: body.displayLabel,
      amount: body.amount,
      currency: body.currency,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      memo: body.memo,
    }),
  });
  if (!res) return { ok: false, message: API_UNAVAILABLE };
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return { ok: false, message: typeof data.message === "string" ? data.message : "Create failed." };
  }
  if (typeof data.customerUrl !== "string" || typeof data.checkoutPath !== "string") {
    return { ok: false, message: "Invalid server response." };
  }
  return {
    ok: true,
    customerUrl: data.customerUrl,
    checkoutPath: data.checkoutPath,
    amount: typeof data.amount === "number" ? data.amount : body.amount,
    currency: typeof data.currency === "string" ? data.currency : body.currency,
    emailSent: data.emailSent === true,
  };
}
