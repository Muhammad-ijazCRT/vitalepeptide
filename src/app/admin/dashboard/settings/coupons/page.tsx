"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createAdminCoupon,
  fetchAdminCouponsDashboard,
  patchAdminCoupon,
  type AdminCouponRow,
  type AdminCouponsDashboard,
} from "@/lib/admin-coupons-client";
import { useAuth } from "@/contexts/auth-provider";
import { useToast } from "@/contexts/toast-provider";
import "./coupons-admin.css";

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

export default function AdminCouponsPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminCouponsDashboard | null>(null);
  const [createCode, setCreateCode] = useState("");
  const [createPercent, setCreatePercent] = useState("10");
  const [createMaxUses, setCreateMaxUses] = useState("");
  const [creating, setCreating] = useState(false);
  const [toggleId, setToggleId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const d = await fetchAdminCouponsDashboard(token);
    setLoading(false);
    if (!d) {
      toast.error("Could not load coupons.");
      return;
    }
    setData(d);
  }, [token, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const code = createCode.trim();
    const pct = Number(createPercent);
    if (!code || code.length < 2) {
      toast.error("Enter a coupon code (at least 2 characters).");
      return;
    }
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
      toast.error("Percent off must be between 1 and 100.");
      return;
    }
    const maxRaw = createMaxUses.trim();
    const maxUses = maxRaw === "" ? null : Number(maxRaw);
    if (maxRaw !== "" && (!Number.isInteger(maxUses) || (maxUses as number) < 1)) {
      toast.error("Max uses must be a positive integer or left empty for unlimited.");
      return;
    }
    setCreating(true);
    const res = await createAdminCoupon(token, { code, percentOff: pct, maxUses });
    setCreating(false);
    if ("message" in res && !("id" in res)) {
      toast.error(res.message);
      return;
    }
    toast.success("Coupon created.");
    setCreateCode("");
    setCreatePercent("10");
    setCreateMaxUses("");
    await load();
  }

  async function toggleActive(row: AdminCouponRow) {
    if (!token) return;
    setToggleId(row.id);
    const res = await patchAdminCoupon(token, row.id, { isActive: !row.isActive });
    setToggleId(null);
    if ("message" in res && !("id" in res)) {
      toast.error(res.message);
      return;
    }
    toast.success(row.isActive ? "Coupon deactivated." : "Coupon activated.");
    await load();
  }

  const stats = data?.stats;
  const coupons = data?.coupons ?? [];
  const performance = data?.performance ?? [];
  const recent = data?.recentCheckouts ?? [];

  return (
    <div className="adm-coupons">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span aria-hidden>🎫</span>
            <span className="adm-coupons__badge">PROMOTIONS</span>
          </div>
          <h1 className="adm-coupons__hero-title mb-2">Coupons</h1>
          <p className="text-secondary small mb-0" style={{ maxWidth: 640 }}>
            Percent discounts apply to cart subtotals before payment. Track redemptions, discount volume, and toggle codes
            without losing history.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="adm-coupons__stat">
            <div className="adm-coupons__stat-label">Discount given</div>
            <div className="adm-coupons__stat-value">{loading ? "…" : money(stats?.lifetimeDiscount ?? 0)}</div>
            <div className="adm-coupons__stat-hint">Lifetime coupon savings</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="adm-coupons__stat">
            <div className="adm-coupons__stat-label">Redemptions</div>
            <div className="adm-coupons__stat-value">{loading ? "…" : stats?.ordersWithCouponCount ?? 0}</div>
            <div className="adm-coupons__stat-hint">Orders that used a code</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="adm-coupons__stat">
            <div className="adm-coupons__stat-label">Active codes</div>
            <div className="adm-coupons__stat-value">{loading ? "…" : stats?.activeCodes ?? 0}</div>
            <div className="adm-coupons__stat-hint">
              {stats ? `${stats.totalCodes} total · ${stats.inactiveCodes} inactive` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="adm-coupons__card p-4">
            <h2 className="adm-coupons__card-title mb-1">Create coupon</h2>
            <p className="text-secondary small mb-3">Codes are stored uppercase. Leave max uses empty for unlimited.</p>
            <form onSubmit={onCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="adm-coupon-code">
                  Code
                </label>
                <input
                  id="adm-coupon-code"
                  className="form-control"
                  placeholder="SAVE10"
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="adm-coupon-pct">
                  Percent off
                </label>
                <div className="input-group">
                  <input
                    id="adm-coupon-pct"
                    type="number"
                    min={1}
                    max={100}
                    step={0.01}
                    className="form-control"
                    value={createPercent}
                    onChange={(e) => setCreatePercent(e.target.value)}
                  />
                  <span className="input-group-text">%</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold" htmlFor="adm-coupon-max">
                  Max uses
                </label>
                <input
                  id="adm-coupon-max"
                  type="number"
                  min={1}
                  step={1}
                  className="form-control"
                  placeholder="∞"
                  value={createMaxUses}
                  onChange={(e) => setCreateMaxUses(e.target.value)}
                />
              </div>
              <button type="submit" className="adm-coupons__btn-gold w-100" disabled={creating}>
                {creating ? "Creating…" : "+ Create coupon"}
              </button>
            </form>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="adm-coupons__card p-4">
            <h2 className="adm-coupons__card-title mb-1">Performance by code</h2>
            <p className="text-secondary small mb-3">Uses and total discount per coupon.</p>
            {loading ? (
              <p className="text-secondary small mb-0">Loading…</p>
            ) : performance.length === 0 ? (
              <div className="adm-coupons__empty">
                <div className="adm-coupons__empty-icon" aria-hidden>
                  📈
                </div>
                No redemption data yet. When customers apply coupons at checkout, breakdowns appear here.
              </div>
            ) : (
              <ul className="list-unstyled mb-0 small">
                {performance.map((p) => (
                  <li key={p.code} className="d-flex justify-content-between py-2 border-bottom border-light">
                    <span className="adm-coupons__code-pill">{p.code}</span>
                    <span className="text-secondary">
                      {p.uses} uses · {money(p.totalDiscount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="adm-coupons__card p-4 mb-4">
        <h2 className="adm-coupons__card-title mb-1">Coupon library</h2>
        <p className="text-secondary small mb-3">Activate or pause codes anytime.</p>
        {loading ? (
          <p className="text-secondary small mb-0">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="text-secondary small mb-0">No coupons yet. Create one on the left.</p>
        ) : (
          <div className="adm-coupons__table-wrap">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Cap</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="adm-coupons__code-pill">{c.code}</span>
                    </td>
                    <td>{Number(c.percentOff).toFixed(2)}%</td>
                    <td className="text-secondary">
                      {c.maxUses == null ? "Unlimited" : `${c.maxUses} max · ${c.usesCount} used`}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive ? "text-bg-success" : "text-bg-secondary"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="adm-coupons__muted-action"
                        disabled={toggleId === c.id}
                        onClick={() => toggleActive(c)}
                      >
                        {toggleId === c.id ? "…" : c.isActive ? "⏸ Deactivate" : "▶ Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-coupons__card p-4">
        <h2 className="adm-coupons__card-title mb-1">Recent checkouts</h2>
        <p className="text-secondary small mb-3">Last 100 orders that applied a coupon.</p>
        {loading ? (
          <p className="text-secondary small mb-0">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="adm-coupons__empty">
            <div className="adm-coupons__empty-icon" aria-hidden>
              🧾
            </div>
            No coupon checkouts recorded yet.
          </div>
        ) : (
          <div className="adm-coupons__table-wrap">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.orderId}>
                    <td>
                      <Link href={`/admin/dashboard/orders/${r.orderId}`} className="small font-monospace">
                        {r.orderId.slice(0, 8)}…
                      </Link>
                    </td>
                    <td>
                      <div className="small fw-semibold">{r.fullName}</div>
                      <div className="small text-secondary">{r.email}</div>
                    </td>
                    <td>
                      <span className="adm-coupons__code-pill">{r.couponCode ?? "—"}</span>
                    </td>
                    <td>{money(r.discountAmount)}</td>
                    <td>{money(r.total)}</td>
                    <td className="small text-secondary">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
