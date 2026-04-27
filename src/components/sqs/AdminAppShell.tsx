"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/auth-provider";
import { fetchNotifCount } from "../../lib/admin-client";

function initials(n: string) {
  return n
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavDropdownChevron() {
  return (
    <span className="sqs-admin-nav__chevron" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 4.25L6 7.75L9.5 4.25" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function topTitle(pathname: string) {
  if (pathname.match(/\/admin\/dashboard\/orders\/[^/]+$/)) return "Order detail";
  if (pathname.endsWith("/admin/dashboard/orders")) return "Orders";
  if (pathname.endsWith("/admin/dashboard/products/new")) return "New product";
  if (pathname.match(/\/admin\/dashboard\/products\/.+\/edit$/)) return "Edit product";
  if (pathname.includes("/admin/dashboard/products/inventory")) return "Inventory";
  if (pathname.startsWith("/admin/dashboard/products")) return "Products";
  if (pathname.match(/\/admin\/dashboard\/users\/[^/]+$/)) return "User details";
  if (pathname.endsWith("/admin/dashboard/users")) return "Users";
  if (pathname.endsWith("/admin/dashboard/profile")) return "Profile";
  if (pathname.includes("/admin/dashboard/settings/coupons")) return "Coupons";
  if (pathname.startsWith("/admin/dashboard/settings")) return "Store settings";
  if (pathname.includes("/admin/dashboard/invoices/payment-link-history")) return "Payment link history";
  if (pathname.includes("/admin/dashboard/invoices/payment-links")) return "Payment links";
  if (pathname.includes("/admin/dashboard/invoices")) return "Invoices";
  return "Dashboard";
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    let cancelled = false;
    const load = () =>
      fetchNotifCount(token).then((c) => {
        if (!cancelled) setNotifCount(c);
      });
    load();
    const id = setInterval(load, 45000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, user?.role]);

  const dashActive = pathname === "/admin/dashboard";
  const pathProducts = pathname.startsWith("/admin/dashboard/products");
  const pathInventory = pathname.includes("/admin/dashboard/products/inventory");
  const ordersActive = pathname.startsWith("/admin/dashboard/orders");
  const usersActive = pathname.startsWith("/admin/dashboard/users");
  const invoicesActive = pathname.startsWith("/admin/dashboard/invoices");
  const pathPaymentLinksCreate = pathname.includes("/admin/dashboard/invoices/payment-links");
  const pathPaymentLinkHistory = pathname.includes("/admin/dashboard/invoices/payment-link-history");
  const pathCoupons = pathname.includes("/admin/dashboard/settings/coupons");
  const pathSettingsStore = pathname.startsWith("/admin/dashboard/settings/store");
  const storeSettingsNavActive =
    (pathname === "/admin/dashboard/settings" || pathSettingsStore) && !pathCoupons;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

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
    function onResize() {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 992px)").matches) {
        setMobileNavOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="sqs-admin-app">
      {mobileNavOpen ? (
        <button
          type="button"
          className="sqs-admin-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside id="sqs-admin-sidebar" className={`sqs-admin-sidebar${mobileNavOpen ? " sqs-admin-sidebar--open" : ""}`}>
        <div className="sqs-admin-sidebar__mobilebar d-lg-none">
          <span className="sqs-admin-sidebar__mobilebar-label">Menu</span>
          <button type="button" className="sqs-admin-sidebar__close" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
            ×
          </button>
        </div>
        <div className="sqs-admin-brand px-2 py-2">
          <Link href="/admin/dashboard" className="d-inline-flex align-items-end lh-1 text-decoration-none flex-shrink-0 min-w-0">
            <Image src="/logo.webp" alt="" width={140} height={40} style={{ height: 40, width: "auto" }} priority />
          </Link>
          <span className="sqs-admin-brand__sub flex-shrink-0">Admin</span>
        </div>
        <nav className="sqs-admin-nav sqs-admin-nav--scroll">
          <Link href="/admin/dashboard" className={dashActive ? "sqs-admin-nav__active" : ""}>
            Dashboard
          </Link>

          <details className="sqs-admin-nav__details" open={pathProducts}>
            <summary className="sqs-admin-nav__summary">
              <span>Products</span>
              <NavDropdownChevron />
            </summary>
            <div className="sqs-admin-nav__subs">
              <Link
                href="/admin/dashboard/products"
                className={pathProducts && !pathInventory ? "sqs-admin-nav__active" : ""}
              >
                All products
              </Link>
              <Link href="/admin/dashboard/products/inventory" className={pathInventory ? "sqs-admin-nav__active" : ""}>
                Inventory
              </Link>
            </div>
          </details>

          <details className="sqs-admin-nav__details" open={ordersActive}>
            <summary className="sqs-admin-nav__summary">
              <span>Orders</span>
              <NavDropdownChevron />
            </summary>
            <div className="sqs-admin-nav__subs">
              <Link href="/admin/dashboard/orders" className={ordersActive ? "sqs-admin-nav__active" : ""}>
                All orders
              </Link>
            </div>
          </details>

          <details className="sqs-admin-nav__details" open={usersActive}>
            <summary className="sqs-admin-nav__summary">
              <span>Users</span>
              <NavDropdownChevron />
            </summary>
            <div className="sqs-admin-nav__subs">
              <Link href="/admin/dashboard/users" className={usersActive ? "sqs-admin-nav__active" : ""}>
                All users
              </Link>
            </div>
          </details>

          <details className="sqs-admin-nav__details" open={invoicesActive}>
            <summary className="sqs-admin-nav__summary">
              <span>Invoices</span>
              <NavDropdownChevron />
            </summary>
            <div className="sqs-admin-nav__subs">
              <Link
                href="/admin/dashboard/invoices/payment-links"
                className={pathPaymentLinksCreate ? "sqs-admin-nav__active" : ""}
              >
                Create link
              </Link>
              <Link
                href="/admin/dashboard/invoices/payment-link-history"
                className={pathPaymentLinkHistory ? "sqs-admin-nav__active" : ""}
              >
                Link history
              </Link>
              <Link
                href="/admin/dashboard/invoices"
                className={invoicesActive && !pathPaymentLinksCreate && !pathPaymentLinkHistory ? "sqs-admin-nav__active" : ""}
              >
                All invoices
              </Link>
            </div>
          </details>

          <Link href="/admin/dashboard/settings/coupons" className={pathCoupons ? "sqs-admin-nav__active" : ""}>
            Coupons
          </Link>

          <div className="sqs-admin-nav__section text-uppercase small text-white-50 px-2 mt-3 mb-1">Settings</div>
          <Link href="/admin/dashboard/settings" className={storeSettingsNavActive ? "sqs-admin-nav__active" : ""}>
            Store settings
          </Link>
        </nav>
        <div className="sqs-admin-sidebar-foot">
          <Link href="/shop">← Back to store</Link>
        </div>
      </aside>
      <div className="sqs-admin-main">
        <header className="sqs-admin-topbar">
          <div className="sqs-admin-topbar__lead">
            <button
              type="button"
              className="sqs-admin-menubtn d-lg-none"
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="sqs-admin-sidebar"
              onClick={() => setMobileNavOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <div className="sqs-admin-topbar__titles">
              <Image src="/logo.webp" alt="" width={64} height={22} style={{ height: 22, width: "auto" }} className="d-lg-none sqs-admin-topbar__logo" />
              <strong className="sqs-admin-topbar__pagetitle">{topTitle(pathname)}</strong>
            </div>
          </div>
          <div className="sqs-admin-topbar__search">
            <input type="search" placeholder="Search products, SKUs…" readOnly aria-label="Search (coming soon)" />
          </div>
          <div className="sqs-admin-topbar__actions sqs-admin-user">
            <Link href="/admin/dashboard/orders" className="position-relative d-inline-block me-2 text-decoration-none" aria-label="Order notifications">
              <span aria-hidden>🔔</span>
              {notifCount > 0 ? (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.55rem", minWidth: "1.1rem" }}
                >
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              ) : null}
            </Link>
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-link text-decoration-none text-dark p-0 d-flex align-items-center gap-2"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen((o) => !o);
                }}
              >
                <div className="sqs-admin-avatar">{user ? initials(user.name) : "AD"}</div>
                <div className="small lh-sm text-end d-none d-sm-block">
                  <div className="fw-semibold">{user?.name ?? "Administrator"}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    Administrator
                  </div>
                </div>
                <span className="small text-secondary" aria-hidden>
                  ▾
                </span>
              </button>
              {userMenuOpen ? (
                <div
                  className="position-absolute end-0 mt-1 bg-white border rounded-2 shadow py-1"
                  style={{ minWidth: 200, zIndex: 1050 }}
                  role="menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href="/admin/dashboard/profile"
                    className="d-block px-3 py-2 small text-decoration-none text-dark"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin/dashboard/settings"
                    className="d-block px-3 py-2 small text-decoration-none text-dark"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="dropdown-divider my-1" />
                  <button
                    type="button"
                    className="d-block w-100 text-start px-3 py-2 small btn btn-link text-danger text-decoration-none rounded-0"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      router.push("/admin/login");
                      router.refresh();
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="sqs-admin-content">{children}</div>
      </div>
    </div>
  );
}
