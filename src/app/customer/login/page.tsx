"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "../../../components/BrandLogo";
import { useAuth } from "../../../contexts/auth-provider";
import { useToast } from "../../../contexts/toast-provider";
import { apiLogin } from "../../../lib/auth-api";
import { siteLabel } from "../../../lib/site";

export default function CustomerLoginPage() {
  const { setSession } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
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
      if (res.data.user.role !== "CUSTOMER") {
        toast.error("This account is not a customer. Use the admin sign-in page.");
        return;
      }
      setSession(res.data.token, res.data.user);
      toast.success("Signed in.");
      router.push("/customer/dashboard");
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
        <h1 className="sqs-auth-title">Sign in</h1>
        <p className="sqs-auth-lead">
          Access <strong>{siteLabel()}</strong>.
        </p>
        <form onSubmit={onSubmit}>
          <label className="sqs-label" htmlFor="cust-email">
            Email
          </label>
          <input
            id="cust-email"
            className="sqs-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
          <label className="sqs-label" htmlFor="cust-password">
            Password
          </label>
          <input
            id="cust-password"
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
        <p className="sqs-auth-footer">
          No account?{" "}
          <Link href="/customer/signup" className="text-decoration-underline">
            Create one
          </Link>
        </p>
      </div>
      <p className="sqs-auth-back">
        <Link href="/shop">← Back to store</Link>
      </p>
    </div>
  );
}
