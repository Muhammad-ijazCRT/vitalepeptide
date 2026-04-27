"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../../components/cart-provider";
import { useWishlist } from "../../../components/wishlist-provider";
import { useAuth } from "../../../contexts/auth-provider";
import { useToast } from "../../../contexts/toast-provider";
import { fetchCustomerOrders, type CustomerOrderRow } from "../../../lib/admin-client";
import { siteLabel } from "../../../lib/site";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function customerStatusClass(status: string) {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  if (s === "completed" || s === "paid") return "sqs-cust-status--success";
  if (s === "pending" || s === "awaiting_payment") return "sqs-cust-status--muted";
  if (s === "cancelled") return "sqs-cust-status--neutral";
  if (s === "processing" || s === "shipped") return "sqs-cust-status--info";
  return "sqs-cust-status--warn";
}

function CustomerStatusPill({ status }: { status: string }) {
  return <span className={`sqs-cust-status ${customerStatusClass(status)}`}>{status}</span>;
}

function IconStatClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5h6l1 2h4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7h4l1-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconStatTimer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 9.5V13l2.5 1.5M9 3h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconStatCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 12.5l4 4 8-10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStatCurrency() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v16M15 7.5A3.5 3.5 0 0 0 8.7 9H8a3 3 0 0 0 0 6h.7a3.5 3.5 0 0 0 6.3 1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconActionCart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 7V5.5a3 3 0 0 1 6 0V7M5.5 7h13l-1.1 11.5H6.6L5.5 7z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.25" cy="18.5" r="1.1" fill="currentColor" />
      <circle cx="16.25" cy="18.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function IconActionHeart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-6.5-4.35-9-8.5C.5 8.5 2.5 5 6 5c2.1 0 3.25 1.3 4 2.5C10.75 6.3 11.9 5 14 5c3.5 0 5.5 3.5 3 7.5-2.5 4.15-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconActionBag() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14l-1.2 12H6.2L5 10z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CustomerDashboardInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const welcome = sp.get("welcome") === "1";
  const { token, user } = useAuth();
  const toast = useToast();
  const { items, total } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<CustomerOrderRow[] | null>(null);

  useEffect(() => {
    if (!welcome || !user?.id) return;
    const key = `vp-welcome-toast:${user.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      toast.success(`Welcome to ${siteLabel()}!`);
    }
    router.replace("/customer/dashboard");
  }, [welcome, toast, router, user?.id]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchCustomerOrders(token).then((o) => {
      if (!cancelled) setOrders(o ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const list = orders ?? [];
    const pending = list.filter((o) => o.status.toLowerCase() === "pending").length;
    const completed = list.filter((o) => o.status.toLowerCase() === "completed").length;
    const spent = list.filter((o) => o.status.toLowerCase() === "completed").reduce((a, o) => a + o.total, 0);
    return [
      {
        label: "Total orders",
        value: String(list.length),
        tone: "blue" as const,
        icon: <IconStatClipboard />,
      },
      {
        label: "Pending orders",
        value: String(pending),
        tone: "orange" as const,
        icon: <IconStatTimer />,
      },
      {
        label: "Completed orders",
        value: String(completed),
        tone: "green" as const,
        icon: <IconStatCheck />,
      },
      {
        label: "Total spent",
        value: money(spent),
        tone: "purple" as const,
        icon: <IconStatCurrency />,
      },
    ];
  }, [orders]);

  const recent = (orders ?? []).slice(0, 8);

  return (
    <div className="sqs-cust-dashboard">
      <div className="mb-4">
        <h1 className="sqs-cust-page-title">My Dashboard</h1>
      </div>

      <div className="row g-3 g-md-4 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="col-6 col-xl-3">
            <div className={`sqs-cust-dash-stat sqs-cust-dash-stat--${s.tone}`}>
              <div className="sqs-cust-dash-stat__accent" aria-hidden />
              <div className="sqs-cust-dash-stat__body">
                <p className="sqs-cust-dash-stat__label">{s.label}</p>
                <p className="sqs-cust-dash-stat__value">{s.value}</p>
              </div>
              <div className="sqs-cust-dash-stat__icon">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link href="/checkout" className="sqs-cust-action-tile sqs-cust-action-tile--checkout">
            <span className="sqs-cust-action-tile__icon" aria-hidden>
              <IconActionCart />
            </span>
            <div>
              <div className="sqs-cust-action-tile__title">Checkout</div>
              <p className="sqs-cust-action-tile__meta">
                {items.length} item{items.length === 1 ? "" : "s"} · {money(total)}
              </p>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/customer/wishlist" className="sqs-cust-action-tile sqs-cust-action-tile--wishlist">
            <span className="sqs-cust-action-tile__icon" aria-hidden>
              <IconActionHeart />
            </span>
            <div>
              <div className="sqs-cust-action-tile__title">Wishlist</div>
              <p className="sqs-cust-action-tile__meta">
                {wishlistCount} item{wishlistCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/shop" className="sqs-cust-action-tile sqs-cust-action-tile--shop">
            <span className="sqs-cust-action-tile__icon" aria-hidden>
              <IconActionBag />
            </span>
            <div>
              <div className="sqs-cust-action-tile__title">Continue shopping</div>
              <p className="sqs-cust-action-tile__meta">Browse Products</p>
            </div>
          </Link>
        </div>
      </div>

      <section className="sqs-cust-orders-panel">
        <div className="sqs-cust-orders-panel__head">
          <h2 className="sqs-cust-orders-panel__title">Recent Orders</h2>
          <Link href="/customer/orders" className="sqs-cust-link-all">
            View All
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0 sqs-cust-table">
            <thead>
              <tr>
                <th className="ps-4">Order #</th>
                <th className="d-none d-md-table-cell">Date</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders === null ? (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-5">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    Loading orders…
                  </td>
                </tr>
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 px-3">
                    <p className="text-secondary mb-3 mb-md-4">You have not placed an order yet.</p>
                    <Link href="/shop" className="btn btn-primary fw-semibold px-4 rounded-pill">
                      Start shopping
                    </Link>
                  </td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.id}>
                    <td className="ps-4 font-monospace fw-medium small">{o.id.slice(0, 10)}…</td>
                    <td className="text-secondary d-none d-md-table-cell text-nowrap small">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="fw-semibold">{money(o.total)}</td>
                    <td>
                      <CustomerStatusPill status={o.status} />
                    </td>
                    <td className="text-end pe-4">
                      <Link href={`/customer/orders/${o.id}`} className="sqs-cust-table-view">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-5 text-center text-secondary" aria-live="polite">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
          Loading dashboard…
        </div>
      }
    >
      <CustomerDashboardInner />
    </Suspense>
  );
}
