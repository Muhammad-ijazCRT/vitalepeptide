"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Product } from "../types";
import { FeaturedProductCard } from "./featured-product-card";

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState({ current: 1, total: 1 });
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track || products.length === 0) {
      setPage({ current: 1, total: 1 });
      setEdge({ start: true, end: true });
      return;
    }

    const card = track.querySelector<HTMLElement>("[data-featured-card]");
    if (!card) return;

    const trackStyle = getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "12") || 12;
    const cardSlot = card.offsetWidth + gap;
    const visible = Math.max(1, Math.floor((track.clientWidth + gap) / cardSlot));
    const totalPages = Math.max(1, Math.ceil(products.length / visible));
    const pageWidth = visible * cardSlot;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const currentPage = Math.min(totalPages, Math.max(1, Math.floor(track.scrollLeft / pageWidth) + 1));

    setPage({ current: currentPage, total: totalPages });
    setEdge({
      start: track.scrollLeft <= 2,
      end: maxScroll <= 2 || track.scrollLeft >= maxScroll - 2,
    });
  }, [products.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sync();
    const onScroll = () => sync();
    track.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => sync());
    ro.observe(track);

    return () => {
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [sync, products.length]);

  const indicator = useMemo(() => `${page.current}/${page.total}`, [page]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track || products.length === 0) return;

    const card = track.querySelector<HTMLElement>("[data-featured-card]");
    if (!card) return;

    const trackStyle = getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "12") || 12;
    const cardSlot = card.offsetWidth + gap;
    const visible = Math.max(1, Math.floor((track.clientWidth + gap) / cardSlot));
    track.scrollBy({ left: direction * visible * cardSlot, behavior: "smooth" });
  }

  if (products.length === 0) {
    return (
      <p className="featured-section__empty text-white-50 mb-0">
        No products available yet. Start the API and run the database seed.
      </p>
    );
  }

  return (
    <>
      <div ref={trackRef} className="featured-track d-flex flex-nowrap overflow-auto w-100">
        {products.map((product) => (
          <div className="featured-track__item flex-shrink-0" key={product.id}>
            <FeaturedProductCard product={product} />
          </div>
        ))}
      </div>
      <div className="featured-pager d-flex align-items-center justify-content-center gap-3 mt-4" aria-label="Featured products pagination">
        <button type="button" className="featured-pager__btn" onClick={() => scrollByPage(-1)} disabled={edge.start} aria-label="Previous products">
          &#8249;
        </button>
        <span className="featured-pager__indicator">{indicator}</span>
        <button type="button" className="featured-pager__btn" onClick={() => scrollByPage(1)} disabled={edge.end} aria-label="Next products">
          &#8250;
        </button>
      </div>
    </>
  );
}
