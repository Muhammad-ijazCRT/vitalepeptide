"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../contexts/auth-provider";
import { useToast } from "../../../../../contexts/toast-provider";
import { fetchAdminUserDetail, type AdminUserDetail } from "../../../../../lib/admin-client";
import { OrderStatusBadge } from "../../../../../components/admin/order-status-badge";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const toast = useToast();
  const [detail, setDetail] = useState<AdminUserDetail | null | undefined>(undefined);

  const load = useCallback(async () => {
    if (!token || !id) return;
    const d = await fetchAdminUserDetail(token, id);
    if (!d) {
      toast.error("Could not load user.");
      setDetail(null);
      return;
    }
    setDetail(d);
  }, [token, id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (detail === undefined) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary py-5">
        <div className="spinner-border spinner-border-sm" role="status" aria-hidden />
        Loading user…
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="alert alert-warning">
        User not found.{" "}
        <Link href="/admin/dashboard/users" className="alert-link">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-1">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard/users">Users</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {detail.name}
              </li>
            </ol>
          </nav>
          <h1 className="h4 fw-semibold mb-0">{detail.name}</h1>
          <p className="text-secondary small mb-0">{detail.email}</p>
        </div>
        <Link href="/admin/dashboard/users" className="btn btn-outline-secondary btn-sm">
          ← All users
        </Link>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 sqs-admin-panel overflow-hidden h-100">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary fw-semibold mb-3">Profile</h2>
              <dl className="row small mb-0">
                <dt className="col-5 text-secondary">Role</dt>
                <dd className="col-7 mb-2">
                  <span className={`badge ${detail.role === "ADMIN" ? "bg-primary" : "bg-secondary"}`}>{detail.role}</span>
                </dd>
                <dt className="col-5 text-secondary">User ID</dt>
                <dd className="col-7 mb-2 font-monospace text-break">{detail.id}</dd>
                <dt className="col-5 text-secondary">Joined</dt>
                <dd className="col-7 mb-0">{formatWhen(detail.createdAt)}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card border-0 sqs-admin-panel overflow-hidden h-100">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary fw-semibold mb-3">Login history</h2>
              <p className="small text-secondary mb-0">
                Sign-in events are not recorded in the database for this deployment. When audit logging is enabled, successful logins will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 sqs-admin-panel overflow-hidden mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h2 className="h6 mb-0 fw-semibold">Orders</h2>
          <span className="badge bg-light text-dark border">{detail.orders.length}</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4">Order</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th className="text-end pe-4"> </th>
              </tr>
            </thead>
            <tbody>
              {detail.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-secondary small">
                    No orders linked to this account yet.
                  </td>
                </tr>
              ) : (
                detail.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="ps-4 font-monospace small">{o.id.slice(0, 8)}…</td>
                    <td className="fw-semibold">{money(o.total)}</td>
                    <td>
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="small text-secondary text-nowrap">{formatWhen(o.createdAt)}</td>
                    <td className="text-end pe-4">
                      <Link href={`/admin/dashboard/orders/${o.id}`} className="btn btn-sm btn-outline-primary">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card border-0 sqs-admin-panel overflow-hidden">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h2 className="h6 mb-0 fw-semibold">Payment links</h2>
          <span className="badge bg-light text-dark border">{detail.paymentLinks.length}</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4">Label</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end pe-4"> </th>
              </tr>
            </thead>
            <tbody>
              {detail.paymentLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-secondary small">
                    No payment invoice links for this email.
                  </td>
                </tr>
              ) : (
                detail.paymentLinks.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-medium">{p.displayLabel}</td>
                    <td>
                      {money(p.amount)} <span className="text-secondary text-uppercase small">{p.currency}</span>
                    </td>
                    <td className="small text-uppercase">{p.gateway}</td>
                    <td>
                      <OrderStatusBadge status={p.status} />
                    </td>
                    <td className="small text-secondary text-nowrap">{formatWhen(p.createdAt)}</td>
                    <td className="text-end pe-4">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => void navigator.clipboard.writeText(p.customerUrl).then(() => toast.success("Link copied."))}
                      >
                        Copy link
                      </button>
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
