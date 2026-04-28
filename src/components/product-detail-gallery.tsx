import Image from "next/image";
import { getProductImageSrc } from "../lib/product-image";
import { Product } from "../types";

export function ProductDetailGallery({ product }: { product: Product }) {
  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__main rounded-3 overflow-hidden">
        <Image
          src={getProductImageSrc(product.imageUrl)}
          alt={product.name}
          width={900}
          height={900}
          className="pdp-gallery__main-img img-fluid w-100 h-auto"
          priority
          sizes="(max-width: 991px) 100vw, 50vw"
        />
      </div>
      <div className="pdp-gallery__thumbs mt-3">
        <button type="button" className="pdp-gallery__thumb rounded-3 overflow-hidden border-0 p-0" aria-label="Product thumbnail">
          <Image src={getProductImageSrc(product.imageUrl)} alt="" width={120} height={120} className="pdp-gallery__thumb-img img-fluid" />
        </button>
      </div>
    </div>
  );
}
