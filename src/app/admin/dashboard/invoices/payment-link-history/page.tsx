"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useToast } from "@/contexts/toast-provider";
import {
  fetchPaymentInvoiceHistory,
  type PaymentInvoiceHistoryRow,
} from "@/lib/admin-payment-invoice-links-client";
import { API_UNAVAILABLE } from "@/lib/safe-fetch";
import "./payment-link-history.css";

function money(n: number, currency: string) {
  const c = currency.toUpperCase();
  return `${c === "USD" ? "$" : ""}${n.toFixed(2)}${c !== "USD" ? ` ${c}` : ""}`;
}

function formatDateTime(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function gatewayLabel(g: string) {
  const x = g.toLowerCase();
  if (x === "nowpayments") return "NOWPayments";
  if (x === "zelle") return "Zelle";
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "paid") return "ph-badge ph-badge--paid rounded-pill px-2 py-1";
  if (s === "pending" || s === "awaiting_payment") return "ph-badge ph-badge--pending rounded-pill px-2 py-1";
  return "ph-badge ph-badge--other rounded-pill px-2 py-1";
}

function rowMatchesSearch(row: PaymentInvoiceHistoryRow, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [
    row.customerEmail,
    row.customerName ?? "",
    row.id,
    row.token,
    row.displayLabel,
    row.customerUrl,
    String(row.amount),
    row.status,
    row.gateway,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(s);
}

export default function PaymentLinkHistoryPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PaymentInvoiceHistoryRow[]>([]);
  const [counts, setCounts] = useState({ pending: 0, paid: 0, all: 0 });
  const [search, setSearch] = useState("");
  const [apiDown, setApiDown] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setApiDown(false);
    const data = await fetchPaymentInvoiceHistory(token);
    setLoading(false);
    if (!data) {
      setApiDown(true);
      setRows([]);
      toast.error(`Could not load history. ${API_UNAVAILABLE}`);
      return;
    }
    setCounts(data.counts);
    setRows(data.rows);
  }, [token, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => rows.filter((r) => rowMatchesSearch(r, search)), [rows, search]);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  return (
    <div className="payment-history-page">
      {apiDown ? (
        <div className="alert alert-warning mb-4" role="status">
          <strong>Store API not reachable.</strong> Check your network connection. If this keeps happening, whoever hosts
          the site can verify the storefront is pointed at the correct API URL and that the API service is running.
        </div>
      ) : null}

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
        <div className="d-flex flex-wrap gap-2">
          <Link
            href="/admin/dashboard/invoices/payment-links"
            className="btn fw-semibold px-4"
            style={{ background: "#c9a227", color: "#1a1a1a", border: "none" }}
          >
            + Create link
          </Link>
          <button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={() => void load()}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 sqs-admin-panel overflow-hidden h-100 ph-card-accent ph-card-accent--pending">
            <div className="card-body">
              <p className="text-uppercase small text-secondary mb-1">Pending</p>
              <p className="h3 mb-0">{loading ? "—" : counts.pending}</p>
              <p className="small text-secondary mb-0">Open payment links</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 sqs-admin-panel overflow-hidden h-100 ph-card-accent ph-card-accent--paid">
            <div className="card-body">
              <p className="text-uppercase small text-secondary mb-1">Paid</p>
              <p className="h3 mb-0">{loading ? "—" : counts.paid}</p>
              <p className="small text-secondary mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 sqs-admin-panel overflow-hidden h-100 ph-card-accent ph-card-accent--total">
            <div className="card-body">
              <p className="text-uppercase small text-secondary mb-1">Total links</p>
              <p className="h3 mb-0">{loading ? "—" : counts.all}</p>
              <p className="small text-secondary mb-0">All statuses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 sqs-admin-panel overflow-hidden">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start mb-3">
            <div>
              <h2 className="h5 fw-semibold mb-1">Payment link history</h2>
              <p className="small text-secondary mb-0">Newest invoices appear first after refresh.</p>
            </div>
            <div style={{ minWidth: "min(100%, 280px)" }}>
              <label htmlFor="ph-search" className="visually-hidden">
                Search
              </label>
              <input
                id="ph-search"
                type="search"
                className="form-control form-control-sm"
                placeholder="Search email, amount, link, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ph-table-wrap">
            <table className="table table-hover ph-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Gateway</th>
                  <th>Zelle proof</th>
                  <th>Amount</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-secondary py-4">
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-secondary py-4">
                      {rows.length === 0 ? "No payment links yet." : "No rows match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const paidLabel = formatDateTime(r.paidAt);
                    return (
                      <tr key={r.id}>
                        <td>
                          <span className={statusBadgeClass(r.status)}>{r.status.replace(/_/g, " ")}</span>
                          {r.status === "paid" && paidLabel ? (
                            <div className="small text-secondary mt-1">{paidLabel}</div>
                          ) : null}
                        </td>
                        <td>
                          <div className="fw-semibold">{r.customerEmail}</div>
                          {r.customerName ? <div className="small text-secondary">{r.customerName}</div> : null}
                        </td>
                        <td>{gatewayLabel(r.gateway)}</td>
                        <td className="text-secondary">—</td>
                        <td className="fw-semibold">{money(r.amount, r.currency)}</td>
                        <td className="text-end">
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => void copyLink(r.customerUrl)}>
                            Copy link
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="small text-secondary mt-3 mb-0">
            NOWPayments results are stored on the linked order when paid. Outgoing mail:{" "}
            <Link href="/admin/dashboard/settings">Store settings</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
