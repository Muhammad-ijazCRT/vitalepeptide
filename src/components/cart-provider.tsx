"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { CartItem, Product } from "../types";

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const normalized: Product = {
      ...product,
      id: String(product.id),
      price: Number(product.price),
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
    };
    const qty = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === normalized.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === normalized.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product: normalized, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const q = Math.max(1, Math.min(99, Math.floor(quantity)));
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: q } : item))
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }),
    [items, total, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
