"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../types";

const STORAGE_KEY = "vp-wishlist-v1";

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    id: String(p.id),
    slug: String(p.slug),
    price: Number(p.price),
    shortDescription: p.shortDescription ?? "",
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
    category: p.category ?? "",
    inStock: Boolean(p.inStock),
  };
}

function parseStored(raw: string): Product[] {
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
      .map((x) =>
        normalizeProduct({
          id: String(x.id ?? ""),
          slug: String(x.slug ?? ""),
          name: String(x.name ?? ""),
          shortDescription: String(x.shortDescription ?? ""),
          description: String(x.description ?? ""),
          price: Number(x.price) || 0,
          imageUrl: String(x.imageUrl ?? ""),
          category: String(x.category ?? ""),
          inStock: Boolean(x.inStock),
        })
      )
      .filter((p) => p.id && p.slug);
  } catch {
    return [];
  }
}

function loadFromStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return parseStored(raw);
  } catch {
    return [];
  }
}

type WishlistContextType = {
  items: Product[];
  itemCount: number;
  hydrated: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addToWishlist = useCallback((product: Product) => {
    const p = normalizeProduct(product);
    setItems((prev) => {
      if (prev.some((x) => x.id === p.id)) return prev;
      return [...prev, p];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    const p = normalizeProduct(product);
    setItems((prev) => {
      if (prev.some((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id);
      return [...prev, p];
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => items.some((x) => x.id === productId), [items]);

  const itemCount = items.length;

  const value = useMemo(
    () => ({
      items,
      itemCount,
      hydrated,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [items, itemCount, hydrated, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
