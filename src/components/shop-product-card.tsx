"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { useToast } from "../contexts/toast-provider";
import { getProductImageSrc } from "../lib/product-image";
import { shopProductSubtitle } from "../lib/shop-filters";
import type { Product } from "../types";

export function ShopProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const subtitle = shopProductSubtitle(product);

  return (
    <article className="store-product-card h-100 d-flex flex-column">
      <Link href={`/shop/${product.slug}`} className="store-product-card__media text-decoration-none">
        <Image
          src={getProductImageSrc(product.imageUrl)}
          alt=""
          width={400}
          height={400}
          className="store-product-card__image"
          sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 22vw"
        />
      </Link>
      <div className="store-product-card__body flex-grow-1 d-flex flex-column">
        <Link href={`/shop/${product.slug}`} className="store-product-card__title-link text-decoration-none">
          <h2 className="store-product-card__title">{product.name}</h2>
        </Link>
        <p className="store-product-card__subtitle">{subtitle}</p>
        <div className="store-product-card__rule" />
        <div className="store-product-card__footer mt-auto">
          <span className="store-product-card__price">${product.price.toFixed(2)}</span>
          <div className="store-product-card__actions">
            <Link href={`/shop/${product.slug}`} className="store-product-card__btn store-product-card__btn--outline">
              VIEW
            </Link>
            <button
              type="button"
              className="store-product-card__btn store-product-card__btn--solid"
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product);
                toast.success(`${product.name} added to cart.`);
              }}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
