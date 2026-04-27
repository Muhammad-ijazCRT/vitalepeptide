"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { useToast } from "../contexts/toast-provider";
import { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const toast = useToast();

  return (
    <article className="shop-grid-card featured-card h-100 d-flex flex-column">
      <Link href={`/shop/${product.slug}`} className="shop-grid-card__image-link text-decoration-none text-reset d-block">
        <div className="featured-card__media">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={360}
            height={360}
            className="featured-card__image img-fluid"
            sizes="(max-width: 767px) 44vw, (max-width: 1199px) 28vw, 15vw"
          />
        </div>
      </Link>
      <div className="featured-card__body d-flex flex-column flex-grow-1 text-center w-100">
        <Link href={`/shop/${product.slug}`} className="text-decoration-none text-reset">
          <h3 className="featured-card__title">{product.name}</h3>
        </Link>
        <p className="featured-card__price">${product.price.toFixed(2)} USD</p>
        <div className="shop-grid-card__actions mt-auto w-100 pt-1">
          <button
            type="button"
            className="shop-grid-card__btn-cart w-100"
            onClick={() => {
              addToCart(product);
              toast.success(`${product.name} added to cart.`);
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
