"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/auth-provider";
import { CartNavLink } from "./cart-nav-link";
import { getProducts } from "../lib/api";
import type { Product } from "../types";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 20c0-3.4 3.1-5.2 7-5.2s7 1.8 7 5.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
      setHighlightIndex(-1);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || catalog !== null) return;
    let cancelled = false;
    setCatalogLoading(true);
    getProducts()
      .then((list) => {
        if (!cancelled) setCatalog(list);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchOpen, catalog]);

  useEffect(() => {
    setSearchOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const close = () => setAccountOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [accountOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (searchPanelRef.current?.contains(t)) return;
      if (searchTriggerRef.current?.contains(t)) return;
      setSearchOpen(false);
    }
    const timer = window.setTimeout(() => {
      document.addEventListener("click", onDocClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onDocClick);
    };
  }, [searchOpen]);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !catalog?.length) return [];
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery, catalog]);

  function toggleSearch() {
    setSearchOpen((prev) => !prev);
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setSearchOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      const pick =
        highlightIndex >= 0 && suggestions[highlightIndex]
          ? suggestions[highlightIndex]
          : suggestions.length === 1
            ? suggestions[0]
            : null;
      if (pick) {
        e.preventDefault();
        setSearchOpen(false);
        router.push(`/shop/${pick.slug}`);
      }
    }
  }

  return (
    <header className="sticky-top border-bottom bg-light-subtle">
      <div className="text-center small py-2 border-bottom">Welcome to our store</div>
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between">
          <button
            ref={searchTriggerRef}
            type="button"
            className="btn btn-link text-dark p-0"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            aria-controls="navbar-search-panel"
            onClick={(e) => {
              e.stopPropagation();
              toggleSearch();
            }}
          >
            <SearchIcon />
          </button>
          <Link href="/" className="navbar-brand-logo text-center text-decoration-none text-dark d-inline-flex align-items-center justify-content-center">
            <Image
              src="/logo.webp"
              alt="Vitale Peptide"
              width={240}
              height={72}
              className="navbar-logo-img"
              priority
            />
          </Link>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm d-lg-none px-2 py-1"
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              Menu
            </button>
            {authLoading ? (
              <Link className="btn btn-link text-dark p-0" aria-label="Account" href="/customer/login">
                <UserIcon />
              </Link>
            ) : user ? (
              <div className="dropdown position-relative">
                <button
                  type="button"
                  className="btn btn-link text-dark p-0"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountOpen((o) => !o);
                  }}
                >
                  <UserIcon />
                </button>
                {accountOpen ? (
                  <div
                    className="dropdown-menu dropdown-menu-end show shadow border-0 py-1 mt-1"
                    style={{ minWidth: 200, zIndex: 1060, right: 0, top: "100%" }}
                    role="menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/admin/dashboard"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        Admin dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/customer/dashboard"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        My Dashboard
                      </Link>
                    )}
                    <hr className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      role="menuitem"
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                        router.push("/");
                        router.refresh();
                      }}
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link className="btn btn-link text-dark p-0" aria-label="Sign in" href="/customer/login">
                <UserIcon />
              </Link>
            )}
            <CartNavLink />
          </div>
        </div>

        {searchOpen ? (
          <div id="navbar-search-panel" ref={searchPanelRef} className="navbar-search-panel mt-3 pb-1" role="search">
            <label htmlFor="navbar-search-input" className="visually-hidden">
              Search products
            </label>
            <div className="position-relative">
              <input
                id="navbar-search-input"
                ref={searchInputRef}
                type="search"
                className="form-control form-control-lg navbar-search-input"
                placeholder="Search by product name…"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightIndex(-1);
                }}
                onKeyDown={onSearchKeyDown}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
                aria-controls="navbar-search-suggestions"
                aria-activedescendant={highlightIndex >= 0 ? `search-suggestion-${highlightIndex}` : undefined}
              />
              {catalogLoading ? (
                <p className="small text-secondary mb-0 mt-2">Loading products…</p>
              ) : null}
              {searchQuery.trim() && catalog && !catalogLoading && suggestions.length === 0 ? (
                <p className="small text-secondary mb-0 mt-2">No matching products.</p>
              ) : null}
              {suggestions.length > 0 ? (
                <ul
                  id="navbar-search-suggestions"
                  className="navbar-search-suggestions list-unstyled mb-0"
                  role="listbox"
                  aria-label="Product suggestions"
                >
                  {suggestions.map((p, index) => (
                    <li key={p.id} role="presentation">
                      <Link
                        id={`search-suggestion-${index}`}
                        href={`/shop/${p.slug}`}
                        className={`navbar-search-suggestion${index === highlightIndex ? " navbar-search-suggestion--active" : ""}`}
                        role="option"
                        aria-selected={index === highlightIndex}
                        onMouseEnter={() => setHighlightIndex(index)}
                        onClick={() => setSearchOpen(false)}
                      >
                        <span className="navbar-search-suggestion__name">{p.name}</span>
                        <span className="navbar-search-suggestion__meta">${p.price.toFixed(2)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}

        <nav
          className={`mt-3 ${isOpen ? "d-flex" : "d-none"} d-lg-flex flex-column flex-lg-row justify-content-center gap-2 gap-lg-4 navbar-site-nav`}
        >
          <Link
            href="/"
            onClick={closeMenu}
            className={`nav-link p-0 text-center text-decoration-none navbar-site-nav__link ${pathname === "/" ? "navbar-site-nav__link--active" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={closeMenu}
            className={`nav-link p-0 text-center text-decoration-none navbar-site-nav__link ${pathname.startsWith("/shop") ? "navbar-site-nav__link--active" : ""}`}
          >
            Store
          </Link>
          <Link
            href="/about-us"
            onClick={closeMenu}
            className={`nav-link p-0 text-center text-decoration-none navbar-site-nav__link ${pathname === "/about-us" ? "navbar-site-nav__link--active" : ""}`}
          >
            About us
          </Link>
          <Link
            href="/contact-us"
            onClick={closeMenu}
            className={`nav-link p-0 text-center text-decoration-none navbar-site-nav__link ${pathname === "/contact-us" ? "navbar-site-nav__link--active" : ""}`}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
