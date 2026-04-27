"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "../../../components/admin/order-status-badge";
import { useAuth } from "../../../contexts/auth-provider";
import { fetchCustomerOrders, type CustomerOrderRow } from "../../../lib/admin-client";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CustomerOrdersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<CustomerOrderRow[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchCustomerOrders(token).then((o) => {
      if (!cancelled) setRows(o ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="sqs-cust-page">
      <div className="mb-4">
        <h1 className="sqs-cust-page-title">My Orders</h1>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-secondary text-uppercase">
                <th className="ps-4 py-3 fw-semibold">Order</th>
                <th className="py-3 fw-semibold d-none d-sm-table-cell">Date</th>
                <th className="py-3 fw-semibold">Total</th>
                <th className="py-3 fw-semibold">Status</th>
                <th className="text-end pe-4 py-3 fw-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-secondary">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 px-3">
                    <p className="text-secondary mb-3">No orders yet.</p>
                    <Link href="/shop" className="btn btn-primary btn-sm fw-semibold px-4">
                      Browse the shop
                    </Link>
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id}>
                    <td className="ps-4 font-monospace fw-medium">{o.id.slice(0, 10)}…</td>
                    <td className="text-secondary d-none d-sm-table-cell text-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="fw-semibold">{money(o.total)}</td>
                    <td>
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="text-end pe-4">
                      <Link href={`/customer/orders/${o.id}`} className="btn btn-sm btn-outline-primary fw-semibold">
                        Details
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
