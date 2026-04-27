"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../contexts/auth-provider";
import { useToast } from "../../../../contexts/toast-provider";
import {
  createAdminUser,
  fetchAdminUsers,
  updateAdminUser,
  type AdminUserRow,
} from "../../../../lib/admin-client";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN" | "CUSTOMER">("CUSTOMER");
  const [formPassword, setFormPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const list = await fetchAdminUsers(token);
    setRows(list ?? []);
    if (!list) toast.error("Could not load users.");
  }, [token, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [rows, query]);

  function openEdit(u: AdminUserRow) {
    setEditing(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormPassword("");
  }

  function openAdd() {
    setAdding(true);
    setFormName("");
    setFormEmail("");
    setFormRole("CUSTOMER");
    setFormPassword("");
  }

  function closeModals() {
    setEditing(null);
    setAdding(false);
    setFormPassword("");
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!token || !editing) return;
    setSaving(true);
    const body: { name: string; email: string; role: "ADMIN" | "CUSTOMER"; password?: string } = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
    };
    if (formPassword.trim().length > 0) {
      if (formPassword.trim().length < 8) {
        toast.error("Password must be at least 8 characters.");
        setSaving(false);
        return;
      }
      body.password = formPassword.trim();
    }
    const res = await updateAdminUser(token, editing.id, body);
    setSaving(false);
    if ("message" in res) {
      toast.error(res.message);
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === res.id ? res : r)) : [res]));
    toast.success("User updated.");
    closeModals();
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (formPassword.trim().length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    const res = await createAdminUser(token, {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      password: formPassword.trim(),
      role: formRole,
    });
    setSaving(false);
    if ("message" in res) {
      toast.error(res.message);
      return;
    }
    setRows((prev) => (prev ? [res, ...prev] : [res]));
    toast.success("User created.");
    closeModals();
  }

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-semibold mb-1">Users</h1>
          <p className="text-secondary small mb-0">Registered accounts. View full profile, orders, and payment links on the detail page.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => load()}>
            Refresh
          </button>
          <button type="button" className="btn btn-dark btn-sm" onClick={openAdd}>
            + Add user
          </button>
        </div>
      </div>

      <div className="card border-0 sqs-admin-panel overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom-0 d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <span className="fw-semibold text-secondary small text-uppercase">Directory</span>
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ maxWidth: 280 }}
            placeholder="Search name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter users"
          />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-secondary text-uppercase">
                <th className="ps-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-end pe-4">Actions</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-secondary">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="ps-4 fw-medium">{u.name}</td>
                    <td className="text-break">{u.email}</td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 ${u.role === "ADMIN" ? "bg-primary" : "bg-secondary-subtle text-secondary border"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="text-nowrap small text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-end pe-4 text-nowrap">
                      <Link href={`/admin/dashboard/users/${u.id}`} className="btn btn-sm btn-outline-primary me-1">
                        View
                      </Link>
                      <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => openEdit(u)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ background: "rgba(15,23,42,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h2 className="modal-title h5 fw-semibold">Edit user</h2>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModals} />
              </div>
              <form onSubmit={onSave}>
                <div className="modal-body pt-2">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="u-name">
                      Full name
                    </label>
                    <input id="u-name" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="u-email">
                      Email
                    </label>
                    <input id="u-email" className="form-control" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="u-role">
                      Role
                    </label>
                    <select id="u-role" className="form-select" value={formRole} onChange={(e) => setFormRole(e.target.value as "ADMIN" | "CUSTOMER")}>
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-semibold" htmlFor="u-pass">
                      New password
                    </label>
                    <input
                      id="u-pass"
                      className="form-control"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Leave blank to keep current password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                    <p className="form-text small mb-0">Minimum 8 characters when changing password.</p>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {adding ? (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ background: "rgba(15,23,42,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h2 className="modal-title h5 fw-semibold">Add user</h2>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModals} />
              </div>
              <form onSubmit={onCreate}>
                <div className="modal-body pt-2">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="a-name">
                      Full name
                    </label>
                    <input id="a-name" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="a-email">
                      Email
                    </label>
                    <input id="a-email" className="form-control" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="a-role">
                      Role
                    </label>
                    <select id="a-role" className="form-select" value={formRole} onChange={(e) => setFormRole(e.target.value as "ADMIN" | "CUSTOMER")}>
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-semibold" htmlFor="a-pass">
                      Password
                    </label>
                    <input
                      id="a-pass"
                      className="form-control"
                      type="password"
                      autoComplete="new-password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="form-text small mb-0">At least 8 characters.</p>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark" disabled={saving}>
                    {saving ? "Creating…" : "Create user"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
