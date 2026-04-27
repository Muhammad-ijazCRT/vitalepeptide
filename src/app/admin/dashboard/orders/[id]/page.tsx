"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../../../../contexts/auth-provider";
import { useToast } from "../../../../../contexts/toast-provider";
import { fetchAdminOrder, patchOrderStatus, type AdminOrderRow } from "../../../../../lib/admin-client";
import { OrderStatusBadge } from "../../../../../components/admin/order-status-badge";

const statuses = ["pending", "processing", "shipped", "completed", "cancelled"] as const;

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function SectionIcon({ id }: { id: "user" | "map" | "receipt" | "status" | "list" }) {
  const c = { width: 20, height: 20, viewBox: "0 0 24 24" as const, fill: "none" as const, stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "user":
      return (
        <svg {...c} aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "map":
      return (
        <svg {...c} aria-hidden>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...c} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    case "status":
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "list":
      return (
        <svg {...c} aria-hidden>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState<AdminOrderRow | null | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    let cancelled = false;
    fetchAdminOrder(token, id).then((o) => {
      if (cancelled) return;
      setOrder(o);
      if (o) setStatus(o.status);
    });
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!token || !id) return;
    setSaving(true);
    const updated = await patchOrderStatus(token, id, status);
    setSaving(false);
    if (updated) {
      setOrder(updated);
      toast.success("Status saved. Customer has been emailed if the status changed.");
    } else {
      toast.error("Could not update status.");
    }
  }

  if (order === undefined) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary py-5">
        <div className="spinner-border spinner-border-sm" role="status" aria-hidden />
        Loading order…
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="alert alert-warning shadow-sm">
        Order not found.{" "}
        <Link href="/admin/dashboard/orders" className="alert-link">
          Back to orders
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <div className="w-100">
      <div className="card border-0 sqs-admin-dash-section mb-4 overflow-hidden">
        <div className="card-body p-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div className="min-w-0">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb small mb-2">
                <li className="breadcrumb-item">
                  <Link href="/admin/dashboard/orders">Orders</Link>
                </li>
                <li className="breadcrumb-item active font-monospace text-truncate" style={{ maxWidth: "12rem" }} aria-current="page">
                  {order.id.slice(0, 8)}…
                </li>
              </ol>
            </nav>
            <h1 className="h3 fw-bold text-dark mb-1">Order detail</h1>
            <p className="text-secondary mb-0 small">
              Placed <span className="fw-medium text-body-secondary">{new Date(order.createdAt).toLocaleString()}</span>
            </p>
          </div>
          <Link href="/admin/dashboard/orders" className="btn btn-outline-secondary fw-semibold">
            ← All orders
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card border-0 h-100 sqs-admin-dash-stat border-start border-4 border-primary overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary p-2">
                  <SectionIcon id="user" />
                </span>
                <h2 className="h6 text-uppercase text-secondary fw-bold mb-0">Customer</h2>
              </div>
              <p className="fw-bold fs-5 mb-2 text-dark">{order.fullName}</p>
              <p className="mb-3">
                <a href={`mailto:${order.email}`} className="text-decoration-none fw-medium">
                  {order.email}
                </a>
              </p>
              <p className="small text-secondary mb-1">
                <span className="text-uppercase fw-bold text-body-secondary" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                  Phone
                </span>
                <br />
                <span className="text-dark">{order.phone || "—"}</span>
              </p>
              {order.userId ? (
                <div className="mt-3 pt-3 border-top">
                  <Link href={`/admin/dashboard/users/${order.userId}`} className="btn btn-sm btn-primary fw-semibold">
                    View user profile
                  </Link>
                </div>
              ) : (
                <p className="small text-secondary mb-0 mt-3 pt-3 border-top">Guest checkout (no linked user account).</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 h-100 sqs-admin-dash-stat border-start border-4 border-success overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success p-2">
                  <SectionIcon id="map" />
                </span>
                <h2 className="h6 text-uppercase text-secondary fw-bold mb-0">Shipping address</h2>
              </div>
              <address className="mb-0 lh-lg text-dark" style={{ fontSize: "0.95rem" }}>
                {order.addressLine1}
                <br />
                {order.city}, {order.postalCode}
                <br />
                <span className="fw-medium">{order.country}</span>
              </address>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 h-100 sqs-admin-dash-stat border-start border-4 border-warning overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-warning-subtle text-warning-emphasis p-2">
                  <SectionIcon id="receipt" />
                </span>
                <h2 className="h6 text-uppercase text-secondary fw-bold mb-0">Summary</h2>
              </div>
              <dl className="row small mb-0">
                <dt className="col-6 text-secondary">Subtotal</dt>
                <dd className="col-6 text-end mb-2 fw-medium">{money(subtotal)}</dd>
                {order.discountAmount > 0 ? (
                  <>
                    <dt className="col-6 text-secondary">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                    <dd className="col-6 text-end mb-2 text-success fw-semibold">−{money(order.discountAmount)}</dd>
                  </>
                ) : null}
                <dt className="col-6 fw-bold text-dark">Total</dt>
                <dd className="col-6 text-end fw-bold fs-4 text-dark mb-3">{money(order.total)}</dd>
                <dt className="col-6 text-secondary align-self-center">Status</dt>
                <dd className="col-6 text-end mb-0">
                  <OrderStatusBadge status={order.status} />
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 sqs-admin-dash-section mb-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-3 align-items-start justify-content-between">
            <div className="d-flex gap-3 min-w-0">
              <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-dark-subtle text-dark p-2 flex-shrink-0 d-none d-sm-flex">
                <SectionIcon id="status" />
              </span>
              <div>
                <h2 className="h5 fw-bold text-dark mb-1">Update status</h2>
                <p className="small text-secondary mb-0">Customers receive an email when the status changes.</p>
              </div>
            </div>
            <form onSubmit={onSave} className="d-flex flex-wrap gap-2 align-items-end">
              <div>
                <label htmlFor="ord-status" className="form-label small fw-semibold text-secondary mb-1">
                  Order status
                </label>
                <select
                  id="ord-status"
                  className="form-select"
                  style={{ minWidth: 220 }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-dark px-4 fw-semibold" disabled={saving}>
                {saving ? "Saving…" : "Save status"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="card border-0 sqs-admin-dash-section overflow-hidden">
        <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center gap-2">
          <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-secondary-subtle text-secondary p-2">
            <SectionIcon id="list" />
          </span>
          <h2 className="h6 mb-0 fw-bold text-dark">Line items</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4 py-3 fw-semibold">Product</th>
                <th className="py-3 fw-semibold">SKU / slug</th>
                <th className="text-center py-3 fw-semibold">Qty</th>
                <th className="text-end py-3 fw-semibold">Unit</th>
                <th className="text-end pe-4 py-3 fw-semibold">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td className="ps-4 fw-semibold text-dark">{i.productName}</td>
                  <td className="font-monospace small text-break">{i.productSlug}</td>
                  <td className="text-center">{i.quantity}</td>
                  <td className="text-end small">{money(i.unitPrice)}</td>
                  <td className="text-end pe-4 fw-bold">{money(i.unitPrice * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
