import Image from "next/image";
import Link from "next/link";
import { getProductImageSrc } from "../lib/product-image";
import { Product } from "../types";

export function RelatedProducts({ title, products }: { title: string; products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="pdp-related pt-4 pt-lg-5 border-top border-secondary-subtle">
      <h2 className="pdp-related__title h4 mb-4">{title}</h2>
      <div className="row row-cols-2 row-cols-md-4 g-3 g-lg-4">
        {products.map((p) => (
          <div className="col" key={p.id}>
            <Link href={`/shop/${p.slug}`} className="pdp-related-card text-decoration-none text-reset d-block h-100">
              <article className="pdp-related-card__inner h-100 d-flex flex-column rounded-3 overflow-hidden">
                <div className="pdp-related-card__media d-flex align-items-center justify-content-center p-3">
                  <Image src={getProductImageSrc(p.imageUrl)} alt={p.name} width={280} height={280} className="pdp-related-card__img img-fluid" sizes="(max-width: 767px) 45vw, 22vw" />
                </div>
                <div className="pdp-related-card__body text-center p-3 pt-2">
                  <h3 className="pdp-related-card__name h6 mb-2">{p.name}</h3>
                  <p className="pdp-related-card__price small mb-0 text-secondary">${p.price.toFixed(2)} USD</p>
                </div>
              </article>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
