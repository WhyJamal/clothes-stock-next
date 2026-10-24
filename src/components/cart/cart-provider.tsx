"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { AnyVariant, CartLine, Product } from "@/types";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (product: Product, variant: AnyVariant) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  /** The cart button in the header: the photo flies to it. */
  cartButtonRef: React.RefObject<HTMLButtonElement | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  const add = useCallback((product: Product, variant: AnyVariant) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === variant.id);
      if (!existing) return [{ key: variant.id, product, variant, qty: 1 }, ...prev];
      // never more than there is in stock
      return prev.map((l) => (l.key === variant.id ? { ...l, qty: Math.min(l.qty + 1, variant.stock) } : l));
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, l.variant.stock) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((sum, l) => sum + l.qty * l.product.price, 0),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      setQty,
      remove,
      cartButtonRef,
    }),
    [lines, isOpen, add, setQty, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
