import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type Search = { orderId?: string; email?: string };

type OrderSummary = {
  id: string;
  status: string;
  total: number;
  fullName: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
};

async function fetchOrderSummary(orderId: string, email: string): Promise<OrderSummary | null> {
  const url = new URL(`${API}/checkout/order-summary`);
  url.searchParams.set("orderId", orderId);
  url.searchParams.set("email", email);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as OrderSummary;
}

type Props = { searchParams: Promise<Search> };

export default async function CheckoutCompletePage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderId = sp.orderId?.trim() ?? "";
  const email = sp.email?.trim() ?? "";

  const summary =
    orderId && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? await fetchOrderSummary(orderId, email) : null;

  const statusNote =
    summary?.status === "awaiting_payment"
      ? "We are waiting for blockchain confirmation. You will get an email when payment is confirmed."
      : summary?.status === "pending"
        ? "Payment received. Your order is being prepared."
        : "Thank you. You will receive email updates when your order status changes.";

  return (
    <main className="container py-5" style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640 }}>
      <h1 className="h4 fw-bold mb-3">Thank you</h1>
      <p className="text-secondary mb-4">{statusNote}</p>

      {summary ? (
        <div className="border rounded-3 p-4 mb-4 bg-light-subtle">
          <p className="small text-uppercase text-secondary mb-2">Order summary</p>
          <p className="mb-1">
            <strong>{summary.fullName}</strong>
          </p>
          <p className="small text-muted mb-3">
            Reference <span className="font-monospace">{summary.id}</span>
            <span className="mx-2">·</span>
            Status: <strong>{summary.status.replace(/_/g, " ")}</strong>
          </p>
          <ul className="list-unstyled small mb-3">
            {summary.items.map((i, idx) => (
              <li key={idx} className="d-flex justify-content-between py-1 border-bottom border-light">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>${i.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mb-0 d-flex justify-content-between fw-semibold">
            <span>Total</span>
            <span>${summary.total.toFixed(2)}</span>
          </p>
        </div>
      ) : orderId ? (
        <p className="small text-muted mb-4">
          Reference: <span className="font-monospace">{orderId}</span>
        </p>
      ) : null}

      <Link href="/shop" className="fw-semibold text-decoration-none">
        Continue shopping
      </Link>
    </main>
  );
}
