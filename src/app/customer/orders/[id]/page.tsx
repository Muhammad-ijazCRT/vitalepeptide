"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "../../../../components/admin/order-status-badge";
import { useAuth } from "../../../../contexts/auth-provider";
import type { CustomerOrderRow } from "../../../../lib/admin-client";
import { getPublicApiUrl } from "../../../../lib/public-api-url";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<CustomerOrderRow | null | undefined>(undefined);

  useEffect(() => {
    if (!token || !id) return;
    const API = getPublicApiUrl();
    let cancelled = false;
    (async () => {
      const res = await fetch(`${API}/customer/orders/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (cancelled) return;
      if (!res.ok) setOrder(null);
      else setOrder(await res.json());
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  if (order === undefined) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary py-5">
        <div className="spinner-border spinner-border-sm" role="status" aria-hidden />
        Loading…
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="alert alert-warning">
        Order not found.{" "}
        <Link href="/customer/orders" className="alert-link">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="sqs-cust-page">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/customer/orders">My Orders</Link>
          </li>
          <li className="breadcrumb-item active font-monospace" aria-current="page">
            {order.id.slice(0, 8)}…
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="sqs-cust-page-title mb-2">Order Detail</h1>
          <p className="text-secondary small mb-0">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-sm-6">
              <p className="text-uppercase small fw-bold text-secondary mb-1">Total</p>
              <p className="h2 fw-bold mb-0">{money(order.total)}</p>
            </div>
            <div className="col-sm-6">
              <p className="text-uppercase small fw-bold text-secondary mb-1">Discount</p>
              <p className="h5 fw-semibold mb-0 text-success">{order.discountAmount > 0 ? `−${money(order.discountAmount)}` : "—"}</p>
              {order.couponCode ? <p className="small text-secondary mb-0 mt-1">Coupon: {order.couponCode}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 fw-bold">Items in this order</div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4 py-2">Product</th>
                <th className="py-2 text-center">Qty</th>
                <th className="text-end pe-4 py-2">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td className="ps-4 fw-medium">{i.productName}</td>
                  <td className="text-center">{i.quantity}</td>
                  <td className="text-end pe-4 fw-semibold">{money(i.unitPrice * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/customer/orders" className="btn btn-outline-secondary">
          ← All orders
        </Link>
      </div>
    </div>
  );
}
