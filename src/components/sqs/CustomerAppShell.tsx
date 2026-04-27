"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/auth-provider";
import { resolveAvatarUrl } from "../../lib/avatar-url";
import { BrandLogo } from "../BrandLogo";
import { CartNavLink } from "../cart-nav-link";
import {
  CustomerNavIconCheckout,
  CustomerNavIconDashboard,
  CustomerNavIconOrders,
  CustomerNavIconProfile,
  CustomerNavIconWishlist,
} from "./customer-nav-icons";

const side: Array<{ href: string; label: string; Icon: ComponentType<{ className?: string }> }> = [
  { href: "/customer/dashboard", label: "Dashboard", Icon: CustomerNavIconDashboard },
  { href: "/customer/orders", label: "My Orders", Icon: CustomerNavIconOrders },
  { href: "/customer/wishlist", label: "Wishlist", Icon: CustomerNavIconWishlist },
  { href: "/checkout", label: "Checkout", Icon: CustomerNavIconCheckout },
  { href: "/customer/profile", label: "Profile & Settings", Icon: CustomerNavIconProfile },
];

function navClass(href: string, pathname: string) {
  if (href === "/customer/dashboard") return pathname === "/customer/dashboard" ? "sqs-cust-sidebar__active" : "";
  if (href === "/checkout") return pathname === "/checkout" ? "sqs-cust-sidebar__active" : "";
  return pathname === href || pathname.startsWith(`${href}/`) ? "sqs-cust-sidebar__active" : "";
}

function initials(n: string) {
  return n
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CustomerAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const close = () => setAccountOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [accountOpen]);

  useEffect(() => {
    function onResize() {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 992px)").matches) {
        setMobileNavOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const headerAvatarSrc = user ? resolveAvatarUrl(user.avatarUrl) : null;

  return (
    <div className="sqs-cust-app">
      {mobileNavOpen ? (
        <button
          type="button"
          className="sqs-cust-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <header className="sqs-cust-top">
        <div className="sqs-cust-top-inner">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <button
              type="button"
              className="sqs-cust-menubtn d-lg-none flex-shrink-0"
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="sqs-cust-sidebar"
              onClick={() => setMobileNavOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <BrandLogo href="/shop" height={44} priority />
          </div>
          <div className="d-flex align-items-center gap-2 gap-sm-3 flex-wrap justify-content-end">
            <Link href="/shop" className="sqs-cust-header-shop">
              Shop
            </Link>
            <CartNavLink variant="compact" className="sqs-cust-header-cart" />
            <div className="dropdown position-relative">
              <button
                type="button"
                className="sqs-cust-account-trigger"
                aria-expanded={accountOpen}
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setAccountOpen((o) => !o);
                }}
              >
                {headerAvatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar served from API /uploads
                  <img src={headerAvatarSrc} alt="" className="sqs-cust-account-trigger__avatar-img" width={32} height={32} />
                ) : (
                  <span className="sqs-cust-account-trigger__avatar">{user ? initials(user.name) : "?"}</span>
                )}
                <span className="sqs-cust-account-trigger__name d-none d-md-inline">{user?.name ?? "Account"}</span>
                <span className="sqs-cust-account-trigger__chevron" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.25L6 7.75L9.5 4.25" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            {accountOpen ? (
              <div
                className="dropdown-menu dropdown-menu-end show shadow border-0 py-1 mt-1"
                style={{ minWidth: 220, zIndex: 1060, right: 0, top: "100%" }}
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown-header text-truncate d-md-none">{user?.name}</div>
                <Link
                  href="/customer/dashboard"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link href="/customer/orders" className="dropdown-item" role="menuitem" onClick={() => setAccountOpen(false)}>
                  My Orders
                </Link>
                <Link href="/customer/profile" className="dropdown-item" role="menuitem" onClick={() => setAccountOpen(false)}>
                  Profile & Settings
                </Link>
                <hr className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                    router.push("/customer/login");
                    router.refresh();
                  }}
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
          </div>
        </div>
      </header>
      <div className="sqs-cust-shell">
        <aside id="sqs-cust-sidebar" className={`sqs-cust-sidebar${mobileNavOpen ? " sqs-cust-sidebar--open" : ""}`}>
          <div className="sqs-cust-sidebar__mobilebar d-lg-none">
            <span className="sqs-cust-sidebar__mobilebar-label">Menu</span>
            <button type="button" className="sqs-cust-sidebar__close" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
              ×
            </button>
          </div>
          <nav className="sqs-cust-sidebar__nav d-flex flex-column">
            {side.map((item) => {
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navClass(item.href, pathname)}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span className="sqs-cust-nav__icon" aria-hidden>
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 pt-3 border-top small px-2 d-none d-lg-block">
            <Link href="/" className="text-secondary text-decoration-none">
              ← Back to store home
            </Link>
          </div>
        </aside>
        <main className="sqs-cust-main">{children}</main>
      </div>
    </div>
  );
}
