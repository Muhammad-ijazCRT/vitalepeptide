"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "../types";

export function FeaturedProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="featured-track__link text-decoration-none text-reset d-block h-100"
      data-featured-card
    >
      <article className="featured-card h-100">
        <div className="featured-card__media">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={360}
            height={360}
            className="featured-card__image img-fluid"
            sizes="(max-width: 767px) 45vw, (max-width: 1199px) 23vw, 16vw"
          />
        </div>
        <div className="featured-card__body">
          <h3 className="featured-card__title">{product.name}</h3>
          <p className="featured-card__price">${product.price.toFixed(2)} USD</p>
        </div>
      </article>
    </Link>
  );
}
