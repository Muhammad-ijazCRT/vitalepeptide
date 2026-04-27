"use client";

import { useEffect, useMemo, useState } from "react";
import { ShopProductCard } from "./shop-product-card";
import {
  productMatchesMgFilters,
  productMgFilterLabels,
  sortMgCatalogLabels,
} from "../lib/shop-filters";
import type { Product } from "../types";

type SortOption =
  | "featured"
  | "price-low-high"
  | "price-high-low"
  | "alpha-asc"
  | "alpha-desc"
  | "name-length";

const QUICK_MG_PRESETS = [2, 5, 10, 15, 20, 25, 30, 50, 100] as const;

function sliderMaxForProducts(products: Product[]): number {
  if (!products.length) return 5000;
  const m = Math.max(...products.map((p) => p.price), 50);
  return Math.min(10000, Math.max(500, Math.ceil(m / 25) * 25));
}

function SearchGlyph() {
  return (
    <svg className="store-toolbar-card__search-svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 16l5 5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function ProductsCollection({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  const sliderMax = useMemo(() => sliderMaxForProducts(products), [products]);
  const [priceCap, setPriceCap] = useState(sliderMax);

  useEffect(() => {
    setPriceCap(sliderMax);
  }, [sliderMax]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );

  const sizeBuckets = useMemo(() => {
    const labelSet = new Set<string>();
    for (const p of products) {
      for (const label of productMgFilterLabels(p)) {
        labelSet.add(label);
      }
    }
    const sorted = sortMgCatalogLabels([...labelSet]);
    return sorted.map((label) => ({
      label,
      count: products.filter((p) => productMgFilterLabels(p).includes(label)).length,
    }));
  }, [products]);

  const quickPresetMg = useMemo(() => {
    const labels = new Set(sizeBuckets.map((b) => b.label));
    return QUICK_MG_PRESETS.filter((n) => labels.has(`${n}mg`));
  }, [sizeBuckets]);

  const hasActiveFilters = useMemo(() => {
    const priceFiltered = priceCap < sliderMax;
    return (
      query.trim().length > 0 ||
      inStockOnly ||
      selectedSizes.size > 0 ||
      selectedCategories.size > 0 ||
      priceFiltered
    );
  }, [query, inStockOnly, selectedSizes, selectedCategories, priceCap, sliderMax]);

  function clearAllFilters() {
    setQuery("");
    setInStockOnly(false);
    setSelectedSizes(new Set());
    setSelectedCategories(new Set());
    setPriceCap(sliderMax);
  }

  function toggleSize(label: string) {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.shortDescription.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        (product.description || "").toLowerCase().includes(normalizedQuery);
      if (!matchesQuery) return false;
      if (inStockOnly && !product.inStock) return false;
      if (product.price > priceCap) return false;

      if (!productMatchesMgFilters(product, selectedSizes)) return false;

      if (selectedCategories.size > 0 && !selectedCategories.has(product.category)) return false;

      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low-high":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "alpha-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alpha-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "name-length":
        sorted.sort((a, b) => a.name.length - b.name.length);
        break;
      default:
        break;
    }

    return sorted;
  }, [products, query, inStockOnly, priceCap, selectedSizes, selectedCategories, sortBy]);

  const priceLabel =
    priceCap >= sliderMax ? `$${sliderMax.toLocaleString()}+` : `$${Math.round(priceCap).toLocaleString()}`;

  return (
    <main className="store-page">
      <section className="store-hero" aria-labelledby="store-hero-heading">
        <h1 id="store-hero-heading" className="store-hero__title">
          All Research Peptides
        </h1>
        <p className="store-hero__text">
          A comprehensive collection of research-grade compounds supplied for non-clinical, in-vitro laboratory research and development.
          Designed to support analytical testing, molecular investigation, cellular studies, formulation research, and exploratory R&amp;D across
          multiple scientific disciplines.
        </p>
      </section>

      <div className="container store-layout">
        <div className="row g-4 g-xl-5 align-items-start">
          <aside className="col-12 col-lg-3 order-1 order-lg-0">
            <div className="store-sidebar-panel">
              <div className="store-sidebar-panel__head">
                <div>
                  <p className="store-sidebar-panel__kicker">Catalog</p>
                  <h2 className="store-sidebar-panel__title">Filters</h2>
                </div>
                {hasActiveFilters ? (
                  <button type="button" className="store-sidebar-panel__reset" onClick={clearAllFilters}>
                    Clear all
                  </button>
                ) : null}
              </div>

              <div className="store-filter-group">
                <div className="store-filter-group__head">
                  <span className="store-filter-group__label">Strength (mg)</span>
                  <span className="store-filter-group__hint">from title &amp; description</span>
                </div>
                {quickPresetMg.length > 0 ? (
                  <div className="store-mg-chips" aria-label="Quick strength filters">
                    {quickPresetMg.map((n) => {
                      const label = `${n}mg`;
                      const on = selectedSizes.has(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          className={`store-mg-chip${on ? " store-mg-chip--active" : ""}`}
                          onClick={() => toggleSize(label)}
                          aria-pressed={on}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <div className="store-filter-list" role="group" aria-label="All strength options">
                  {sizeBuckets.map(({ label, count }) => (
                    <label key={label} className="store-filter-row">
                      <input type="checkbox" checked={selectedSizes.has(label)} onChange={() => toggleSize(label)} />
                      <span className="store-filter-row__text">{label}</span>
                      <span className="store-filter-row__count">{count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="store-filter-group">
                <div className="store-filter-group__head">
                  <span className="store-filter-group__label">Max price</span>
                  <span className="store-filter-group__value">{priceLabel}</span>
                </div>
                <div className="store-price-slider-wrap">
                  <input
                    type="range"
                    className="store-price-slider"
                    min={0}
                    max={sliderMax}
                    step={sliderMax > 2000 ? 25 : 5}
                    value={priceCap}
                    onChange={(e) => setPriceCap(Number(e.target.value))}
                    aria-valuemin={0}
                    aria-valuemax={sliderMax}
                    aria-valuenow={priceCap}
                    aria-label="Maximum price filter"
                  />
                </div>
              </div>

              {categories.length > 0 ? (
                <div className="store-filter-group">
                  <div className="store-filter-group__head">
                    <span className="store-filter-group__label">Category</span>
                  </div>
                  <div className="store-filter-list">
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category === cat).length;
                      return (
                        <label key={cat} className="store-filter-row">
                          <input type="checkbox" checked={selectedCategories.has(cat)} onChange={() => toggleCategory(cat)} />
                          <span className="store-filter-row__text">{cat}</span>
                          <span className="store-filter-row__count">{count}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="store-filter-group store-filter-group--flush">
                <label className="store-filter-row store-filter-row--single">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  <span className="store-filter-row__text">In stock only</span>
                </label>
              </div>
            </div>
          </aside>

          <div className="col-12 col-lg-9 order-2 order-lg-1">
            <div className="store-toolbar-card">
              <div className="store-toolbar-card__row store-toolbar-card__row--top">
                <p className="store-toolbar-card__count">
                  <span className="store-toolbar-card__count-num">{visibleProducts.length}</span>
                  <span className="store-toolbar-card__count-label">products</span>
                </p>
                {hasActiveFilters ? (
                  <button type="button" className="store-toolbar-card__link-reset d-lg-none" onClick={clearAllFilters}>
                    Clear filters
                  </button>
                ) : null}
              </div>
              <div className="store-toolbar-card__row store-toolbar-card__row--controls">
                <div className="store-toolbar-card__search-wrap">
                  <span className="store-toolbar-card__search-icon" aria-hidden>
                    <SearchGlyph />
                  </span>
                  <input
                    type="search"
                    className="store-toolbar-card__search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or details…"
                    aria-label="Search products"
                  />
                </div>
                <div className="store-toolbar-card__sort-wrap">
                  <label htmlFor="store-sort-select" className="store-toolbar-card__sort-label">
                    Sort
                  </label>
                  <div className="store-toolbar-card__select-shell">
                    <select
                      id="store-sort-select"
                      className="store-toolbar-card__select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low-high">Price: low → high</option>
                      <option value="price-high-low">Price: high → low</option>
                      <option value="alpha-asc">Name A–Z</option>
                      <option value="alpha-desc">Name Z–A</option>
                      <option value="name-length">Name length</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <p className="store-empty-state text-secondary small py-5 text-center mb-0">
                No products match these filters. Try clearing strength filters or increasing max price.
              </p>
            ) : (
              <div className="store-grid">
                {visibleProducts.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
