import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailGallery } from "../../../components/product-detail-gallery";
import { ProductDetailPurchase } from "../../../components/product-detail-purchase";
import { RelatedProducts } from "../../../components/related-products";
import { getProduct, getProducts } from "../../../lib/api";

type PageProps = { params: Promise<{ slug: string }> };

function pickRelated(all: Awaited<ReturnType<typeof getProducts>>, currentId: string, category: string) {
  const others = all.filter((p) => p.id !== currentId);
  const sameCat = others.filter((p) => p.category === category);
  const rest = others.filter((p) => p.category !== category);
  const merged = [...sameCat, ...rest];
  return merged.slice(0, 4);
}

export default async function ShopProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getProduct(slug), getProducts()]);

  if (!product) {
    notFound();
  }

  const related = pickRelated(catalog, product.id, product.category);

  return (
    <main className="pdp">
      <div className="container py-3 py-lg-4">
        <nav aria-label="Breadcrumb" className="mb-3 mb-lg-4">
          <Link href="/shop" className="pdp-back text-decoration-none small">
            ← Store
          </Link>
        </nav>

        <div className="row g-4 g-xl-5 align-items-start">
          <div className="col-lg-6 col-xl-7">
            <ProductDetailGallery product={product} />
          </div>
          <div className="col-lg-6 col-xl-5">
            <ProductDetailPurchase product={product} />
          </div>
        </div>

        <RelatedProducts title="You may also like" products={related} />
      </div>
    </main>
  );
}
