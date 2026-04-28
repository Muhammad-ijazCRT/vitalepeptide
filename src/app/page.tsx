import Image from "next/image";
import Link from "next/link";
import { FeaturedCarousel } from "../components/featured-carousel";
import { ProductCard } from "../components/product-card";
import { getProducts } from "../lib/api";
import { getProductImageSrc } from "../lib/product-image";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <section className="home-hero py-3 py-lg-5">
        <div className="container px-3 px-sm-4">
          <div className="home-hero__shell overflow-hidden">
            <div className="row g-0 align-items-stretch">
              <div className="col-lg-5 col-xl-4 order-2 order-lg-1">
                <div className="home-hero__content h-100 d-flex flex-column justify-content-center">
                  <p className="home-hero__eyebrow mb-0">Research-grade supply</p>
                  <h1 className="home-hero__title">Browse our latest products</h1>
                  <p className="home-hero__lead mb-0">
                    Targeted wellness support with clean formulas and simple daily use.
                  </p>
                  <Link className="btn home-hero__cta align-self-start mt-4" href="/shop">
                    Shop now
                  </Link>
                </div>
              </div>
              <div className="col-lg-7 col-xl-8 order-1 order-lg-2">
                <div className="home-hero__visual position-relative">
                  <Image
                    src="/microscope-view.webp"
                    alt="Laboratory microscope and research workspace"
                    fill
                    priority
                    className="home-hero__image object-fit-cover"
                    sizes="(max-width: 991px) 100vw, 70vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section py-4 py-lg-5">
        <div className="container px-3 px-sm-4">
          <h2 className="featured-section__title">Featured products</h2>
        </div>
        <div className="featured-section__carousel px-3 px-sm-4 px-md-4 px-lg-5">
          <FeaturedCarousel products={products} />
        </div>
      </section>

      <section className="container py-4 py-lg-5">
        <div className="bg-body-tertiary rounded-3 border py-5 text-center">
          <h2 className="mb-3 h1">Mission Statement</h2>
          <p className="mx-auto mission-copy px-2 px-md-4 px-lg-0 mb-4 fs-5">
            Advancing scientific discovery with precision and integrity.
            <br />
            Premium research-grade peptides you can trust.
            <br />
            <strong>For Research Purpose Only.</strong>
          </p>
          <Link className="btn btn-primary px-4" href="/about-us">
            About us
          </Link>
        </div>
      </section>

      <section className="container pb-4 pb-lg-5">
        <div className="row g-4 g-lg-5 align-items-stretch">
          <div className="col-lg-8 d-flex">
            <div className="w-100 bg-white border rounded-3 p-3 p-lg-4 shadow-sm">
              <h2 className="mb-3 h2">Multimedia collage</h2>
              <p className="text-secondary mb-3">A featured visual from our latest collection.</p>
            <Image
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80"
              alt="Lab preparation"
              width={1000}
              height={760}
              className="img-fluid w-100 rounded-3 object-fit-cover"
            />
            </div>
          </div>
          <aside className="col-lg-4 d-flex">
            <div className="w-100 bg-white border rounded-3 p-3 p-lg-4 shadow-sm d-grid gap-3 align-content-start">
              <h3 className="h5 mb-0">Featured Products</h3>
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="mini-card-link text-decoration-none text-reset"
                  aria-label={`View ${product.name}`}
                >
                  <article className="bg-light border rounded-3 p-2 d-grid mini-card h-100">
                    <Image
                      src={getProductImageSrc(product.imageUrl)}
                      alt=""
                      width={72}
                      height={72}
                      className="rounded object-fit-cover"
                      sizes="72px"
                    />
                    <div className="min-w-0">
                      <p className="h6 mb-1 text-truncate">{product.name}</p>
                      <p className="mb-0 fw-semibold">${product.price.toFixed(2)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="container pb-4">
        <div className="d-flex justify-content-between align-items-end mb-3">
          <h2 className="mb-0 h2">Why choose us</h2>
          <Link href="/shop" className="btn btn-outline-dark btn-sm">
            See all products
          </Link>
        </div>
        <div className="row g-3 g-lg-4">
          <article className="col-md-4">
            <div className="bg-white border rounded-3 p-3 p-lg-4 h-100 shadow-sm">
              <h3 className="h5">Research-first quality</h3>
              <p className="mb-0 text-secondary">Formulations built around practical ingredients and quality sourcing standards.</p>
            </div>
          </article>
          <article className="col-md-4">
            <div className="bg-white border rounded-3 p-3 p-lg-4 h-100 shadow-sm">
              <h3 className="h5">Fast and reliable delivery</h3>
              <p className="mb-0 text-secondary">Orders are prepared quickly with clear tracking and support.</p>
            </div>
          </article>
          <article className="col-md-4">
            <div className="bg-white border rounded-3 p-3 p-lg-4 h-100 shadow-sm">
              <h3 className="h5">Satisfaction support</h3>
              <p className="mb-0 text-secondary">Our team helps with product guidance and order follow-up when needed.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="container pb-4 pb-lg-5">
        <h2 className="mb-3 h2">FAQs</h2>
        <p className="text-secondary mb-3">Common questions from our customers.</p>
        <details className="bg-white border rounded-3 p-3 p-lg-4 mb-2 shadow-sm">
          <summary>How long does shipping take?</summary>
          <p className="mb-0 mt-2 text-secondary">Standard delivery usually takes 3-7 business days based on your location.</p>
        </details>
        <details className="bg-white border rounded-3 p-3 p-lg-4 mb-2 shadow-sm">
          <summary>Do you offer returns?</summary>
          <p className="mb-0 mt-2 text-secondary">Yes, contact support within the return window and we will guide you.</p>
        </details>
        <details className="bg-white border rounded-3 p-3 p-lg-4 shadow-sm">
          <summary>Are your products tested?</summary>
          <p className="mb-0 mt-2 text-secondary">Yes, products are made with quality controls and batch-level checks.</p>
        </details>
      </section>

      <section className="featured-section home-shop-grid-section py-4 py-lg-5">
        <div className="container px-3 px-sm-4">
          <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-3 mb-3 mb-lg-4">
            <h2 className="featured-section__title mb-0">Shop all products</h2>
            <p className="home-shop-grid-section__subtitle mb-0 d-none d-md-block">Research-grade peptides for your lab</p>
          </div>
          <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3 g-lg-4 home-shop-grid">
            {products.slice(0, 6).map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-center mt-4">
            <Link className="btn btn-outline-light btn-sm px-4 py-2 rounded-pill text-uppercase small" href="/shop">
              View all products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
