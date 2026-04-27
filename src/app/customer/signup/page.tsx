"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "../../../components/BrandLogo";
import { useAuth } from "../../../contexts/auth-provider";
import { useToast } from "../../../contexts/toast-provider";
import { apiSignup } from "../../../lib/auth-api";
import { siteLabel } from "../../../lib/site";

export default function CustomerSignupPage() {
  const { setSession } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const res = await apiSignup({ name, email, password, role: "CUSTOMER" });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setSession(res.data.token, res.data.user);
      router.push("/customer/dashboard?welcome=1");
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
        <h1 className="sqs-auth-title">Create account</h1>
        <p className="sqs-auth-lead">
          Join <strong>{siteLabel()}</strong> for ordering and account tools.
        </p>
        <form onSubmit={onSubmit}>
          <label className="sqs-label" htmlFor="c-su-name">
            Full name
          </label>
          <input id="c-su-name" className="sqs-input" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="sqs-label" htmlFor="c-su-email">
            Email
          </label>
          <input
            id="c-su-email"
            className="sqs-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="sqs-label" htmlFor="c-su-pass">
            Password
          </label>
          <input
            id="c-su-pass"
            className="sqs-input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <label className="sqs-label" htmlFor="c-su-pass2">
            Confirm password
          </label>
          <input
            id="c-su-pass2"
            className="sqs-input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
          <button className="sqs-btn-black" type="submit" disabled={pending}>
            Sign up
          </button>
        </form>
        <p className="sqs-auth-footer">
          Already have an account?{" "}
          <Link href="/customer/login" className="text-decoration-underline">
            Sign in
          </Link>
        </p>
      </div>
      <p className="sqs-auth-back">
        <Link href="/shop">← Back to store</Link>
      </p>
    </div>
  );
}
