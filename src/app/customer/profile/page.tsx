"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/auth-provider";
import { useToast } from "../../../contexts/toast-provider";
import { apiDeleteAvatar, apiUpdateProfile, apiUploadAvatar } from "../../../lib/auth-api";
import { resolveAvatarUrl } from "../../../lib/avatar-url";

function initials(n: string) {
  return n
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CustomerProfilePage() {
  const { user, token, loading: authLoading, setSession } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  async function onPickAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2 MB or smaller.");
      return;
    }
    setUploadingAvatar(true);
    const res = await apiUploadAvatar(token, file);
    setUploadingAvatar(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setSession(res.token, res.user);
    toast.success("Profile photo updated.");
  }

  async function onRemoveAvatar() {
    if (!token || !user?.avatarUrl) return;
    setUploadingAvatar(true);
    const res = await apiDeleteAvatar(token);
    setUploadingAvatar(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setSession(res.token, res.user);
    toast.info("Profile photo removed.");
  }

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail) {
      toast.error("Name and email are required.");
      return;
    }
    if (trimmedName === user.name && trimmedEmail === user.email) {
      toast.info("No changes to save.");
      return;
    }
    setSavingProfile(true);
    const res = await apiUpdateProfile(token, {
      ...(trimmedName !== user.name ? { name: trimmedName } : {}),
      ...(trimmedEmail !== user.email ? { email: trimmedEmail } : {}),
    });
    setSavingProfile(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setSession(res.token, res.user);
    toast.success("Profile updated.");
  }

  async function onSavePassword(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!currentPassword || !newPassword) {
      toast.error("Enter your current password and a new password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const res = await apiUpdateProfile(token, {
      currentPassword,
      newPassword,
    });
    setSavingPassword(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setSession(res.token, res.user);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated.");
  }

  if (authLoading || !user) {
    return (
      <div className="sqs-cust-page">
        <div className="mb-4">
          <h1 className="sqs-cust-page-title">Profile & Settings</h1>
        </div>
        <div className="d-flex align-items-center gap-2 text-secondary py-5">
          <div className="spinner-border spinner-border-sm" role="status" aria-hidden />
          Loading profile…
        </div>
      </div>
    );
  }

  const profileDirty = name.trim() !== user.name || email.trim().toLowerCase() !== user.email;
  const avatarSrc = resolveAvatarUrl(user.avatarUrl);

  return (
    <div className="sqs-cust-page">
      <div className="mb-4">
        <h1 className="sqs-cust-page-title">Profile & Settings</h1>
        <p className="text-secondary small mb-0 mt-2">
          Member since{" "}
          <time dateTime={user.createdAt}>{new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</time>
        </p>
      </div>

      <section className="sqs-cust-settings-panel" aria-labelledby="profile-photo-heading">
        <h2 id="profile-photo-heading" className="sqs-cust-settings-panel__title">
          Profile photo
        </h2>
        <div className="sqs-cust-settings-panel__body">
          <div className="sqs-cust-profile-photo mb-0">
            <div className="sqs-cust-profile-photo__ring" aria-hidden={avatarSrc ? undefined : true}>
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- API-hosted upload URL
                <img src={avatarSrc} alt="" className="sqs-cust-profile-photo__img" />
              ) : (
                <span className="sqs-cust-profile-photo__placeholder">{initials(user.name)}</span>
              )}
            </div>
            <div className="flex-grow-1 min-w-0">
              <p className="sqs-cust-settings-hint mb-3">JPG, PNG, WebP, or GIF. Maximum size 2 MB.</p>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <label className="btn btn-outline-dark rounded-pill px-4 fw-semibold mb-0">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="d-none"
                    onChange={onPickAvatar}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden />
                      Working…
                    </>
                  ) : (
                    "Upload photo"
                  )}
                </label>
                {user.avatarUrl ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => void onRemoveAvatar()}
                    disabled={uploadingAvatar}
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sqs-cust-settings-panel" aria-labelledby="profile-account-heading">
        <h2 id="profile-account-heading" className="sqs-cust-settings-panel__title">
          Account
        </h2>
        <div className="sqs-cust-settings-panel__body">
          <form onSubmit={onSaveProfile} noValidate>
            <div className="mb-4">
              <label className="sqs-cust-settings-label d-block" htmlFor="profile-name">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                className="form-control form-control-lg rounded-3 border-secondary-subtle"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={savingProfile}
              />
            </div>
            <div className="mb-4">
              <label className="sqs-cust-settings-label d-block" htmlFor="profile-email">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                className="form-control form-control-lg rounded-3 border-secondary-subtle"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={savingProfile}
              />
              <p className="sqs-cust-settings-hint mb-0">Used to sign in. Updating your email changes where we send order updates.</p>
            </div>
            <button type="submit" className="btn btn-dark rounded-pill px-4 fw-semibold" disabled={savingProfile || !profileDirty}>
              {savingProfile ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>
        </div>
      </section>

      <section className="sqs-cust-settings-panel" aria-labelledby="profile-security-heading">
        <h2 id="profile-security-heading" className="sqs-cust-settings-panel__title">
          Security
        </h2>
        <div className="sqs-cust-settings-panel__body">
          <form onSubmit={onSavePassword} noValidate>
            <div className="mb-3">
              <label className="sqs-cust-settings-label d-block" htmlFor="profile-current-password">
                Current password
              </label>
              <input
                id="profile-current-password"
                type="password"
                className="form-control rounded-3 border-secondary-subtle"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={savingPassword}
              />
            </div>
            <div className="mb-3">
              <label className="sqs-cust-settings-label d-block" htmlFor="profile-new-password">
                New password
              </label>
              <input
                id="profile-new-password"
                type="password"
                className="form-control rounded-3 border-secondary-subtle"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={savingPassword}
              />
              <p className="sqs-cust-settings-hint mb-0">At least 8 characters.</p>
            </div>
            <div className="mb-4">
              <label className="sqs-cust-settings-label d-block" htmlFor="profile-confirm-password">
                Confirm new password
              </label>
              <input
                id="profile-confirm-password"
                type="password"
                className="form-control rounded-3 border-secondary-subtle"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={savingPassword}
              />
            </div>
            <button type="submit" className="btn btn-outline-dark rounded-pill px-4 fw-semibold" disabled={savingPassword}>
              {savingPassword ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>
      </section>

      <p className="small text-secondary mb-0">
        Need help?{" "}
        <Link href="/contact" className="sqs-cust-link-all">
          Contact us
        </Link>
      </p>
    </div>
  );
}
