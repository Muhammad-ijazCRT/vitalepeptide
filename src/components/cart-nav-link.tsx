"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

function CartGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="navbar-cart__svg">
      <path
        d="M9 7V5.5a3 3 0 0 1 6 0V7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.5 7h13l-1.1 11.5H6.6L5.5 7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9.25" cy="18.5" r="1.15" fill="currentColor" />
      <circle cx="16.25" cy="18.5" r="1.15" fill="currentColor" />
    </svg>
  );
}

type Props = {
  /** Larger tap target + icon for main site header */
  variant?: "header" | "compact";
  className?: string;
};

export function CartNavLink({ variant = "header", className = "" }: Props) {
  const { itemCount } = useCart();
  const isHeader = variant === "header";
  const iconSize = isHeader ? 24 : 22;



  
  return (
    <Link
      href="/checkout"
      className={`navbar-cart ${isHeader ? "navbar-cart--header" : "navbar-cart--compact"} ${className}`.trim()}
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
    >
      <span className="navbar-cart__icon-wrap">
        <CartGlyph size={iconSize} />
        {itemCount > 0 ? (
          <span className="navbar-cart__badge" aria-hidden="true">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
