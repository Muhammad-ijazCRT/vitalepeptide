"use client";

import { useCallback, useState } from "react";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { useToast } from "../contexts/toast-provider";
import { Product } from "../types";

export function ProductDetailPurchase({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, hydrated } = useWishlist();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [shareLabel, setShareLabel] = useState("Share");

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => Math.min(99, q + 1));

  const onAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity);
    toast.success(
      quantity === 1 ? "Added to cart. Open checkout when you are ready." : `Added ${quantity} to cart. Open checkout when you are ready.`
    );
  };

  const onWishlistClick = () => {
    const wasSaved = isInWishlist(product.id);
    toggleWishlist(product);
    if (wasSaved) {
      toast.info("Removed from your wishlist.");
    } else {
      toast.success("Saved to your wishlist.");
    }
  };

  const saved = hydrated && isInWishlist(product.id);

  const onShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Link copied");
      setTimeout(() => setShareLabel("Share"), 2000);
    } catch {
      setShareLabel("Copy failed");
      setTimeout(() => setShareLabel("Share"), 2000);
    }
  }, []);

  return (
    <div className="pdp-purchase">
      <p className="pdp-purchase__brand text-uppercase small mb-2">Vitale Peptide</p>
      <h1 className="pdp-purchase__title mb-3">{product.name}</h1>
      <p className="pdp-purchase__price mb-4">${product.price.toFixed(2)} USD</p>

      {!product.inStock && <p className="text-danger small mb-3">Currently out of stock</p>}

      <div className="mb-4">
        <label className="pdp-purchase__qty-label d-block small text-secondary mb-2">Quantity</label>
        <div className="pdp-qty d-inline-flex align-items-stretch w-auto">
          <button type="button" className="btn pdp-qty__btn" onClick={dec} disabled={!product.inStock || quantity <= 1} aria-label="Decrease quantity">
            −
          </button>
          <span className="pdp-qty__value d-flex align-items-center justify-content-center">{quantity}</span>
          <button type="button" className="btn pdp-qty__btn" onClick={inc} disabled={!product.inStock || quantity >= 99} aria-label="Increase quantity">
            +
          </button>
        </div>
      </div>

      <div className="d-grid gap-2 mb-4">
        <button type="button" className="btn pdp-btn pdp-btn--outline py-2" onClick={onAddToCart} disabled={!product.inStock}>
          Add to cart
        </button>
        <button
          type="button"
          className={`btn pdp-btn py-2 ${saved ? "pdp-btn--outline" : "pdp-btn--primary"}`}
          onClick={onWishlistClick}
          aria-pressed={saved}
        >
          {saved ? "Saved to wishlist" : "Add to wishlist"}
        </button>
      </div>

      <div className="pdp-purchase__prose text-secondary small mb-4">
        {(product.description ?? "")
          .split(/\n+/)
          .map((para) => para.trim())
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="mb-3 lh-lg">
              {para}
            </p>
          ))}
        {(product.description ?? "").trim().length === 0 && (
          <p className="mb-0 lh-lg">{product.shortDescription}</p>
        )}
      </div>

      <div className="pdp-details mb-4">
        <h2 className="pdp-details__heading h6 text-uppercase text-secondary mb-3">Product details</h2>
        <ul className="pdp-details__list small text-secondary mb-0">
          <li>
            <span className="text-dark fw-medium">Category:</span> {product.category}
          </li>
          <li>
            <span className="text-dark fw-medium">Availability:</span> {product.inStock ? "In stock" : "Out of stock"}
          </li>
          <li>
            <span className="text-dark fw-medium">Format:</span> Lyophilized research use
          </li>
          <li>
            <span className="text-dark fw-medium">Storage:</span> Store per labeling; typically cool, dry, away from light.
          </li>
          <li>
            <span className="text-dark fw-medium">Use:</span> For research purposes only. Not for human consumption, medical, or diagnostic use.
          </li>
        </ul>
      </div>

      <p className="pdp-disclaimer small text-secondary mb-4">
        Information on this page is provided for research context only and is not medical or regulatory advice.
      </p>

      <button type="button" className="btn btn-link p-0 pdp-share text-decoration-none small" onClick={onShare}>
        <span className="pdp-share__icon me-1" aria-hidden="true">
          ↗
        </span>
        {shareLabel}
      </button>
    </div>
  );
}
