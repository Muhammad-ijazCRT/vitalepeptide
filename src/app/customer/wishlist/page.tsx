"use client";

import Link from "next/link";
import { useWishlist } from "../../../components/wishlist-provider";
import { getProductImageSrc } from "../../../lib/product-image";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CustomerWishlistPage() {
  const { items, removeFromWishlist, hydrated } = useWishlist();

  if (!hydrated) {
    return (
      <div className="sqs-cust-page">
        <div className="mb-4">
          <h1 className="sqs-cust-page-title">Wishlist</h1>
        </div>
        <div className="text-secondary py-5 text-center small">Loading…</div>
      </div>
    );
  }

  return (
    <div className="sqs-cust-page">
      <div className="mb-4">
        <h1 className="sqs-cust-page-title">Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5 px-4">
          <p className="text-secondary mb-4 mb-md-5">You have not saved any products yet.</p>
          <Link href="/shop" className="btn btn-primary fw-semibold px-4 rounded-pill">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden">
          <ul className="list-group list-group-flush">
            {items.map((p) => (
              <li key={p.id} className="list-group-item py-3 px-3 px-md-4">
                <div className="row align-items-center g-3">
                  <div className="col-auto">
                    <Link href={`/shop/${encodeURIComponent(p.slug)}`} className="d-block rounded-2 overflow-hidden bg-light">
                      {/* eslint-disable-next-line @next/next/no-img-element -- stored catalog URLs may be any origin */}
                      <img
                        src={getProductImageSrc(p.imageUrl)}
                        alt=""
                        width={88}
                        height={88}
                        className="d-block"
                        style={{ width: 88, height: 88, objectFit: "cover" }}
                      />
                    </Link>
                  </div>
                  <div className="col min-w-0">
                    <Link href={`/shop/${encodeURIComponent(p.slug)}`} className="fw-semibold text-dark text-decoration-none d-block text-truncate">
                      {p.name}
                    </Link>
                    <p className="small text-secondary mb-0">{money(p.price)} USD</p>
                  </div>
                  <div className="col-12 col-sm-auto d-flex flex-wrap gap-2 justify-content-sm-end">
                    <Link href={`/shop/${encodeURIComponent(p.slug)}`} className="btn btn-sm btn-outline-primary">
                      View product
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => removeFromWishlist(p.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
