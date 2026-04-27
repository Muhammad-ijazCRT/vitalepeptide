"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "../../../components/BrandLogo";
import { useAuth } from "../../../contexts/auth-provider";
import { useToast } from "../../../contexts/toast-provider";
import { apiLogin } from "../../../lib/auth-api";

export default function AdminLoginPage() {
  const { setSession } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("admin@sqspeptides.local");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await apiLogin({ email, password });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      if (res.data.user.role !== "ADMIN") {
        toast.error("This account is not an administrator. Use the customer sign-in page.");
        return;
      }
      setSession(res.data.token, res.data.user);
      toast.success("Signed in.");
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="sqs-auth-page">
      <div className="sqs-auth-card">
        <div className="d-flex justify-content-center mb-3">
          <BrandLogo href="/shop" height={52} priority />
        </div>
        <h1 className="sqs-auth-title">Admin sign in</h1>
        <p className="sqs-auth-hint">
          Run <code>pnpm run db:seed:users</code> in <code>backend/</code>, then sign in with{" "}
          <code>ADMIN_EMAIL</code> / <code>ADMIN_PASSWORD</code> from <code>backend/.env</code> (defaults:{" "}
          <code>admin@sqspeptides.local</code> / <code>ChangeMeAdmin123!</code>).
        </p>
        <form onSubmit={onSubmit}>
          <label className="sqs-label" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            className="sqs-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
          <label className="sqs-label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className="sqs-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
          />
          <button className="sqs-btn-black" type="submit" disabled={pending}>
            Sign in
          </button>
        </form>
        <p className="sqs-auth-footer">Administrator access is issued by the store owner.</p>
      </div>
      <p className="sqs-auth-back">
        <Link href="/shop">← Back to store</Link>
      </p>
    </div>
  );
}
