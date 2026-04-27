"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/auth-provider";
import { fetchAdminOrders, markAllNotificationsRead, type AdminOrderRow } from "../../../../lib/admin-client";
import { OrderStatusBadge } from "../../../../components/admin/order-status-badge";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<AdminOrderRow[] | null>(null);

  useEffect(() => {
    if (!token) return;
    markAllNotificationsRead(token).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchAdminOrders(token).then((o) => {
      if (!cancelled) setRows(o ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-semibold mb-1">Orders</h1>
          <p className="text-secondary small mb-0">Fulfillment queue and customer payments. New orders are highlighted until opened.</p>
        </div>
        <span className="badge bg-light text-dark border px-3 py-2">{rows ? `${rows.length} orders` : "Loading…"}</span>
      </div>

      <div className="card border-0 sqs-admin-panel overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4">Order</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id}>
                    <td className="ps-4 font-monospace small">{o.id.slice(0, 10)}…</td>
                    <td className="fw-medium">{o.fullName}</td>
                    <td className="text-break small">{o.email}</td>
                    <td className="fw-semibold">{money(o.total)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        <OrderStatusBadge status={o.status} />
                        {!o.seenByAdmin ? (
                          <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle">New</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="small text-secondary text-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="text-end pe-4">
                      <Link href={`/admin/dashboard/orders/${o.id}`} className="btn btn-sm btn-primary">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
