"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "../../../components/admin/order-status-badge";
import { useAuth } from "../../../contexts/auth-provider";
import { fetchAdminOrders, fetchAdminStats, type AdminOrderRow, type AdminStats } from "../../../lib/admin-client";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

type StatIconId = "orders" | "products" | "users" | "revenue" | "calendar" | "chart" | "clock";

function DashStatIcon({ id }: { id: StatIconId }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24" as const, fill: "none" as const, stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "orders":
      return (
        <svg {...common} aria-hidden>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case "products":
      return (
        <svg {...common} aria-hidden>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
      );
    case "users":
      return (
        <svg {...common} aria-hidden>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "revenue":
      return (
        <svg {...common} aria-hidden>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} aria-hidden>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<AdminOrderRow[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const [s, o] = await Promise.all([fetchAdminStats(token), fetchAdminOrders(token)]);
      if (cancelled) return;
      setStats(s);
      setRecent((o ?? []).slice(0, 10));
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const top = stats
    ? [
        {
          label: "Total orders",
          value: String(stats.totalOrders),
          sub: `${stats.ordersThisMonth} this month`,
          border: "primary",
          icon: "orders" as const,
          iconWrap: "bg-primary-subtle text-primary",
        },
        {
          label: "Total products",
          value: String(stats.totalProducts),
          sub: "Live catalog",
          border: "success",
          icon: "products" as const,
          iconWrap: "bg-success-subtle text-success",
        },
        {
          label: "Total users",
          value: String(stats.totalUsers),
          sub: `${stats.newUsersToday} new today`,
          border: "info",
          icon: "users" as const,
          iconWrap: "bg-info-subtle text-info",
        },
        {
          label: "Total revenue",
          value: money(stats.totalRevenue),
          sub: `${stats.completedOrdersCount} completed orders`,
          border: "warning",
          icon: "revenue" as const,
          iconWrap: "bg-warning-subtle text-warning-emphasis",
        },
      ]
    : null;

  const mid = stats
    ? [
        {
          label: "Today's orders",
          value: String(stats.todayOrders),
          sub: "Server date",
          border: "primary",
          icon: "calendar" as const,
          iconWrap: "bg-primary-subtle text-primary",
        },
        {
          label: "Monthly orders",
          value: String(stats.monthlyOrders),
          sub: "Current month",
          border: "danger",
          icon: "chart" as const,
          iconWrap: "bg-danger-subtle text-danger",
        },
        {
          label: "Pending orders",
          value: String(stats.pendingOrders),
          sub: "Awaiting action",
          border: "secondary",
          icon: "clock" as const,
          iconWrap: "bg-secondary-subtle text-secondary-emphasis",
        },
      ]
    : null;

  return (
    <div className="w-100">
      <div className="row g-3 g-lg-4 mb-3 mb-lg-4">
        {top
          ? top.map((s) => (
              <div key={s.label} className="col-sm-6 col-xl-3">
                <div className={`card border-0 h-100 border-start border-5 border-${s.border} sqs-admin-dash-stat`}>
                  <div className="card-body position-relative pt-4 pe-4">
                    <div className={`sqs-admin-dash-stat__icon position-absolute top-0 end-0 m-3 ${s.iconWrap}`}>
                      <DashStatIcon id={s.icon} />
                    </div>
                    <p className="text-uppercase small text-secondary fw-bold mb-2 pe-5" style={{ letterSpacing: "0.06em" }}>
                      {s.label}
                    </p>
                    <p className="h3 mb-2 fw-bold text-dark">{s.value}</p>
                    <p className="small text-secondary mb-0">{s.sub}</p>
                  </div>
                </div>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="col-sm-6 col-xl-3">
                <div className="card border-0 h-100 sqs-admin-dash-stat" style={{ minHeight: 132 }}>
                  <div className="card-body placeholder-glow">
                    <span className="placeholder col-8" />
                    <span className="placeholder col-5 mt-4" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="row g-3 g-lg-4 mb-4">
        {mid
          ? mid.map((s) => (
              <div key={s.label} className="col-md-4">
                <div className={`card border-0 h-100 border-start border-4 border-${s.border} sqs-admin-dash-stat`}>
                  <div className="card-body position-relative pt-4 pe-4">
                    <div className={`sqs-admin-dash-stat__icon position-absolute top-0 end-0 m-3 ${s.iconWrap}`}>
                      <DashStatIcon id={s.icon} />
                    </div>
                    <p className="text-uppercase small text-secondary fw-bold mb-2 pe-5" style={{ letterSpacing: "0.06em" }}>
                      {s.label}
                    </p>
                    <p className="h3 mb-2 fw-bold text-dark">{s.value}</p>
                    <p className="small text-secondary mb-0">{s.sub}</p>
                  </div>
                </div>
              </div>
            ))
          : Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="col-md-4">
                <div className="card border-0 h-100 sqs-admin-dash-stat" style={{ minHeight: 120 }}>
                  <div className="card-body placeholder-glow">
                    <span className="placeholder col-7" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="card border-0 sqs-admin-dash-section overflow-hidden">
        <div className="card-header bg-white py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <h2 className="h6 mb-0 fw-bold text-dark">Recent orders</h2>
          <Link href="/admin/dashboard/orders" className="btn btn-sm btn-primary fw-semibold px-3">
            View all
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4 py-3 fw-semibold">Order</th>
                <th className="py-3 fw-semibold">Customer</th>
                <th className="py-3 fw-semibold">Email</th>
                <th className="py-3 fw-semibold">Amount</th>
                <th className="py-3 fw-semibold">Status</th>
                <th className="py-3 fw-semibold">Date</th>
                <th className="text-end pe-4 py-3 fw-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-5 small">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.id}>
                    <td className="ps-4 font-monospace small">{o.id.slice(0, 12)}…</td>
                    <td className="fw-medium">{o.fullName}</td>
                    <td className="text-break small">{o.email}</td>
                    <td className="fw-semibold">{money(o.total)}</td>
                    <td>
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="small text-secondary text-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="text-end pe-4">
                      <Link href={`/admin/dashboard/orders/${o.id}`} className="btn btn-sm btn-primary fw-semibold">
                        View
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
