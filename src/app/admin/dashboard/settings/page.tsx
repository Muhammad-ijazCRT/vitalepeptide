"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/auth-provider";
import { useToast } from "../../../../contexts/toast-provider";
import { fetchAdminSettings, updateAdminSettings } from "../../../../lib/admin-client";

type Tab = "payments" | "mail";

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("payments");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [mailFrom, setMailFrom] = useState("");
  const [adminNotifyEmail, setAdminNotifyEmail] = useState("");

  const [npSandbox, setNpSandbox] = useState(true);
  /** Optional new API key when replacing; leave blank to keep saved key. */
  const [npApiKeyNew, setNpApiKeyNew] = useState("");
  const [npStoredApiKey, setNpStoredApiKey] = useState<string | null>(null);
  const [npPublicKey, setNpPublicKey] = useState("");
  const [npApiKeySet, setNpApiKeySet] = useState(false);
  const [smtpPassSet, setSmtpPassSet] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const s = await fetchAdminSettings(token);
    setLoading(false);
    if (!s) return;
    setSmtpHost(s.mail.smtpHost ?? "");
    setSmtpPort(s.mail.smtpPort != null ? String(s.mail.smtpPort) : "");
    setSmtpSecure(s.mail.smtpSecure);
    setSmtpUser(s.mail.smtpUser ?? "");
    setSmtpPass("");
    setMailFrom(s.mail.mailFrom ?? "");
    setAdminNotifyEmail(s.mail.adminNotifyEmail ?? "");
    setSmtpPassSet(s.mail.smtpPassSet);
    setNpSandbox(s.nowpayments.environment !== "live");
    setNpPublicKey(s.nowpayments.publicKey ?? "");
    setNpApiKeyNew("");
    setNpStoredApiKey(s.nowpayments.apiKey ?? null);
    setNpApiKeySet(s.nowpayments.apiKeySet);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSaveMail(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    const rawPort = smtpPort.trim();
    const portNum = rawPort ? Number(rawPort) : NaN;
    const smtpPortVal = rawPort && Number.isFinite(portNum) && portNum >= 1 && portNum <= 65535 ? portNum : null;
    const body: Record<string, unknown> = {
      mail: {
        smtpHost: smtpHost.trim() || null,
        smtpPort: smtpPortVal,
        smtpSecure,
        smtpUser: smtpUser.trim() || null,
        mailFrom: mailFrom.trim() || null,
        adminNotifyEmail: adminNotifyEmail.trim() || null,
      },
    };
    if (smtpPass.trim()) {
      (body.mail as Record<string, unknown>).smtpPass = smtpPass.trim();
    }
    const res = await updateAdminSettings(token, body);
    setSaving(false);
    if ("message" in res && !("mail" in res)) {
      toast.error(res.message);
      return;
    }
    toast.success("Mail settings saved.");
    setSmtpPass("");
    await load();
  }

  async function onSavePayments(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    const nowpayments: Record<string, unknown> = {
      environment: npSandbox ? "sandbox" : "live",
      publicKey: npPublicKey.trim() || null,
    };
    if (npApiKeyNew.trim()) {
      nowpayments.apiKey = npApiKeyNew.trim();
    }
    const res = await updateAdminSettings(token, { nowpayments });
    setSaving(false);
    if ("message" in res && !("mail" in res)) {
      toast.error(res.message);
      return;
    }
    toast.success("Payment settings saved.");
    setNpApiKeyNew("");
    await load();
  }

  async function onClearNpApiKey() {
    if (!token) return;
    if (!window.confirm("Remove NOWPayments API key?")) return;
    setSaving(true);
    const res = await updateAdminSettings(token, { nowpayments: { apiKey: "" } });
    setSaving(false);
    if ("message" in res && !("mail" in res)) {
      toast.error(res.message);
      return;
    }
    toast.success("API key removed.");
    await load();
  }

  const npReady = npApiKeySet;
  const mailConfigured = Boolean(smtpHost.trim() && mailFrom.trim());

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary py-5">
        <div className="spinner-border spinner-border-sm" role="status" aria-hidden />
        Loading settings…
      </div>
    );
  }

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h4 fw-semibold mb-1">Store settings</h1>
          <p className="text-secondary small mb-0">
            Payment gateways and outgoing mail are stored in the database. Each tab has its own save action and only updates that section.
          </p>
        </div>
        <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm">
          ← Dashboard
        </Link>
      </div>

      <ul className="nav nav-tabs mb-0" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "payments"}
            className={`nav-link d-flex align-items-center gap-2 ${tab === "payments" ? "active fw-semibold" : ""}`}
            onClick={() => setTab("payments")}
          >
            <span aria-hidden>💳</span> Payment
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "mail"}
            className={`nav-link d-flex align-items-center gap-2 ${tab === "mail" ? "active fw-semibold" : ""}`}
            onClick={() => setTab("mail")}
          >
            <span aria-hidden>✉️</span> SMTP / email
          </button>
        </li>
      </ul>

      <div className="card border-top-0 rounded-top-0 sqs-admin-panel overflow-hidden mb-4">
        <div className="card-body p-4">
          {tab === "payments" ? (
            <form onSubmit={onSavePayments}>
              <div className="card border-0 bg-light mb-4 sqs-admin-subpanel">
                <div className="card-body">
                  <div className="d-flex border-start border-4 border-success ps-3">
                    <div>
                      <h2 className="h6 fw-semibold mb-1">NOWPayments</h2>
                      <p className="small text-secondary mb-2">
                        Crypto checkout and admin payment links use these keys. The storefront checks NOWPayments when the customer returns from payment.
                      </p>
                      <p className={`small mb-0 fw-medium ${npReady ? "text-success" : "text-secondary"}`}>
                        Status: {npReady ? "Ready for crypto checkout" : "Add an API key from NOWPayments to enable checkout"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">NOWPayments API key</label>
                  {npApiKeySet && npStoredApiKey ? (
                    <>
                      <input
                        id="np-api-saved"
                        readOnly
                        className="form-control font-monospace small mb-2"
                        value={npStoredApiKey}
                        spellCheck={false}
                        aria-label="Saved NOWPayments API key"
                      />
                      <label className="form-label text-uppercase small text-secondary fw-semibold" htmlFor="np-api-new">
                        Replace API key (optional)
                      </label>
                      <input
                        id="np-api-new"
                        type="password"
                        className="form-control font-monospace"
                        value={npApiKeyNew}
                        onChange={(e) => setNpApiKeyNew(e.target.value)}
                        placeholder="Paste new key only if replacing"
                        autoComplete="new-password"
                      />
                    </>
                  ) : (
                    <input
                      id="np-api-first"
                      type="password"
                      className="form-control font-monospace"
                      value={npApiKeyNew}
                      onChange={(e) => setNpApiKeyNew(e.target.value)}
                      placeholder="Paste API key from NOWPayments"
                      autoComplete="new-password"
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">Public key</label>
                  <input
                    className="form-control font-monospace"
                    value={npPublicKey}
                    onChange={(e) => setNpPublicKey(e.target.value)}
                    placeholder="Public key from NOWPayments dashboard"
                    autoComplete="off"
                  />
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="np-sandbox"
                      checked={npSandbox}
                      onChange={(e) => setNpSandbox(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="np-sandbox">
                      Use NOWPayments sandbox API (<span className="font-monospace">api-sandbox.nowpayments.io</span>)
                    </label>
                  </div>
                </div>
                <div className="col-12 d-flex flex-wrap gap-2 align-items-center pt-2">
                  <button type="submit" className="btn btn-dark px-4" disabled={saving}>
                    {saving ? "Saving…" : "Save payment settings"}
                  </button>
                  {npApiKeySet ? (
                    <button type="button" className="btn btn-outline-danger" disabled={saving} onClick={onClearNpApiKey}>
                      Remove NOWPayments keys
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={onSaveMail}>
              <div className="card border-0 bg-light mb-4 sqs-admin-subpanel">
                <div className="card-body">
                  <div className="d-flex border-start border-4 border-primary ps-3">
                    <div>
                      <h2 className="h6 fw-semibold mb-1">Outgoing mail</h2>
                      <p className="small text-secondary mb-2">
                        Values saved here override the API server&apos;s SMTP environment when set. Leave fields empty to fall back to environment variables.
                      </p>
                      <p className={`small mb-0 fw-medium ${mailConfigured ? "text-success" : "text-secondary"}`}>
                        Status: {mailConfigured ? "SMTP host and from address look configured" : "Complete host and from address for reliable delivery"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">SMTP host</label>
                  <input className="form-control" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.example.com" />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">Port</label>
                  <input className="form-control" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="smtp-sec" checked={smtpSecure} onChange={(e) => setSmtpSecure(e.target.checked)} />
                    <label className="form-check-label" htmlFor="smtp-sec">
                      TLS / SSL (secure)
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">SMTP username</label>
                  <input className="form-control" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} autoComplete="off" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">SMTP password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder={smtpPassSet ? "•••••••• (leave blank to keep)" : ""}
                    autoComplete="new-password"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">From address</label>
                  <input className="form-control" value={mailFrom} onChange={(e) => setMailFrom(e.target.value)} placeholder="orders@yourdomain.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-uppercase small text-secondary fw-semibold">Admin notify email</label>
                  <input
                    className="form-control"
                    value={adminNotifyEmail}
                    onChange={(e) => setAdminNotifyEmail(e.target.value)}
                    placeholder="alerts@yourdomain.com"
                  />
                </div>
                <div className="col-12 pt-2">
                  <button type="submit" className="btn btn-dark px-4" disabled={saving}>
                    {saving ? "Saving…" : "Save mail settings"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
