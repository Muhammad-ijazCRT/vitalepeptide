"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useToast } from "@/contexts/toast-provider";
import {
  createPaymentInvoiceLink,
  fetchPaymentInvoiceDashboard,
  type PaymentInvoiceDashboard,
} from "@/lib/admin-payment-invoice-links-client";
import { API_UNAVAILABLE } from "@/lib/safe-fetch";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminPaymentLinksPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentInvoiceDashboard | null>(null);
  const [apiDown, setApiDown] = useState(false);
  const [creating, setCreating] = useState(false);
  const [displayLabel, setDisplayLabel] = useState("NOWPayments");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [memo, setMemo] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setData(null);
      setApiDown(false);
      return;
    }
    setLoading(true);
    setApiDown(false);
    const d = await fetchPaymentInvoiceDashboard(token);
    setLoading(false);
    if (!d) {
      setApiDown(true);
      setData(null);
      toast.error(`Could not load payment links. ${API_UNAVAILABLE}`);
      return;
    }
    setData(d);
  }, [token, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("You are not signed in. Refresh the page or log in again.");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    const email = customerEmail.trim();
    if (!email) {
      toast.error("Customer email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid customer email address.");
      return;
    }
    const label = displayLabel.trim() || "Payment";
    setCreating(true);
    try {
      const res = await createPaymentInvoiceLink(token, {
        displayLabel: label,
        amount: amt,
        currency: currency.trim().toLowerCase() || "usd",
        customerEmail: email,
        customerName: customerName.trim() || null,
        memo: memo.trim() || null,
      });
      if (!res.ok) {
        const unreachable = res.message === API_UNAVAILABLE;
        toast.error(res.message);
        setApiDown(unreachable);
        return;
      }
      setApiDown(false);
      if (res.emailSent) {
        toast.success("Payment link created and emailed to the customer.");
      } else {
        toast.success("Payment link created.");
        toast.info(
          "Confirmation email was not sent — configure SMTP under Store settings if you want automatic emails. Copy the customer link below or from Recent payment links."
        );
      }
      setAmount("");
      setCustomerEmail("");
      setCustomerName("");
      setMemo("");
      await load();
      try {
        await navigator.clipboard.writeText(res.customerUrl);
        toast.info("Customer link copied to clipboard.");
      } catch {
        toast.info("Link created. Copy it from Recent payment links if clipboard is blocked.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Check the console and try again.");
    } finally {
      setCreating(false);
    }
  }

  const counts = data?.counts ?? { pending: 0, paid: 0, all: 0 };

  return (
    <div className="row g-4">
      <div className="col-12 d-flex justify-content-end">
        <Link href="/admin/dashboard/invoices/payment-link-history" className="btn btn-sm btn-outline-secondary">
          View link history
        </Link>
      </div>
      {apiDown ? (
        <div className="col-12">
          <div className="alert alert-warning mb-0" role="status">
            <strong>API not reachable.</strong> Start the backend from the project:{" "}
            <code className="user-select-all">cd backend</code> then <code className="user-select-all">pnpm run dev</code>{" "}
            (default <code className="user-select-all">http://localhost:3001</code>). Match{" "}
            <code className="user-select-all">NEXT_PUBLIC_API_URL</code> in the site root <code>.env</code> if you use a
            different port.
          </div>
        </div>
      ) : null}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card border-0 sqs-admin-panel overflow-hidden h-100 border-start border-warning border-3">
              <div className="card-body">
                <p className="text-uppercase small text-secondary mb-1">Pending</p>
                <p className="h3 mb-0">{loading ? "—" : counts.pending}</p>
                <p className="small text-secondary mb-0">Awaiting payment</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 sqs-admin-panel overflow-hidden h-100 border-start border-success border-3">
              <div className="card-body">
                <p className="text-uppercase small text-secondary mb-1">Paid</p>
                <p className="h3 mb-0">{loading ? "—" : counts.paid}</p>
                <p className="small text-secondary mb-0">Completed links</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 sqs-admin-panel overflow-hidden h-100 border-start border-primary border-3">
              <div className="card-body">
                <p className="text-uppercase small text-secondary mb-1">All links</p>
                <p className="h3 mb-0">{loading ? "—" : counts.all}</p>
                <p className="small text-secondary mb-0">Created to date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card border-0 sqs-admin-panel overflow-hidden">
          <div className="card-body">
            <h2 className="h5 fw-semibold mb-4">New invoice</h2>
            <form onSubmit={onCreate} noValidate>
              <div className="mb-3">
                <label className="form-label small text-secondary">Gateway</label>
                <select className="form-select" disabled aria-readonly>
                  <option>NOWPayments (crypto)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small text-secondary" htmlFor="pil-label">
                  Display label
                </label>
                <input
                  id="pil-label"
                  className="form-control"
                  value={displayLabel}
                  onChange={(e) => setDisplayLabel(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="form-label small text-secondary" htmlFor="pil-amount">
                    Amount
                  </label>
                  <input
                    id="pil-amount"
                    className="form-control"
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small text-secondary" htmlFor="pil-currency">
                    Currency
                  </label>
                  <input
                    id="pil-currency"
                    className="form-control"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small text-secondary" htmlFor="pil-email">
                  Customer email
                </label>
                <input
                  id="pil-email"
                  className="form-control"
                  type="email"
                  autoComplete="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-secondary" htmlFor="pil-name">
                  Customer name (optional)
                </label>
                <input
                  id="pil-name"
                  className="form-control"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-secondary" htmlFor="pil-memo">
                  Memo / description (optional)
                </label>
                <textarea
                  id="pil-memo"
                  className="form-control"
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  maxLength={2000}
                />
              </div>
              <p className="small text-secondary mb-3">Invoice amount in fiat (e.g. USD). NOWPayments keys live under Store settings.</p>
              <button type="submit" className="btn w-100 py-2 fw-semibold" style={{ background: "#c9a227", color: "#1a1a1a" }} disabled={creating}>
                {creating ? "Creating…" : "+ Create payment link"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="card border-0 sqs-admin-panel overflow-hidden">
          <div className="card-body">
            <h3 className="h6 fw-semibold mb-3">Recent payment links</h3>
            {!data?.recent.length ? (
              <p className="small text-secondary mb-0">No links yet.</p>
            ) : (
              <ul className="list-unstyled mb-0 small">
                {data.recent.slice(0, 12).map((r) => (
                  <li key={r.id} className="border-bottom py-2">
                    <div className="d-flex justify-content-between gap-2">
                      <span className="fw-medium text-truncate">{r.displayLabel}</span>
                      <span className="text-nowrap">{money(r.amount)}</span>
                    </div>
                    <div className="text-secondary text-truncate">{r.customerEmail}</div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="badge bg-light text-dark text-uppercase" style={{ fontSize: "0.65rem" }}>
                        {r.status}
                      </span>
                      <span className="text-secondary" style={{ fontSize: "0.7rem" }}>
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 mt-1"
                      onClick={() => {
                        void navigator.clipboard.writeText(r.customerUrl).then(
                          () => toast.success("Link copied."),
                          () => toast.error("Could not copy.")
                        );
                      }}
                    >
                      Copy customer link
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
