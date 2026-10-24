"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useCart } from "@/components/cart/cart-provider";
import { ProductDetail } from "@/components/product-detail";
import type { AnyVariant, Box, Product } from "@/types";

type OpenOptions = {
  /** Called when the card has finished closing (the item can show up on the rail/shelf again). */
  onExited?: () => void;
};

type QuickViewContextValue = {
  /** Opens the product card. The photo flies from `origin` (a rectangle on the screen). */
  open: (product: Product, origin: Box, options?: OpenOptions) => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

type Selected = { product: Product; origin: Box };

/**
 * Owns the product card, so the rail, the shelf and the home page can all open the same one.
 * Lives next to the cart (see src/app/(root)/layout.tsx).
 */
export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const { add, openCart, cartButtonRef } = useCart();
  const [selected, setSelected] = useState<Selected | null>(null);
  // Where the photo flies when the card closes: the cart icon, or null = back to where it came from.
  const [flyTo, setFlyTo] = useState<Box | null>(null);
  const onExited = useRef<(() => void) | undefined>(undefined);

  const open = useCallback<QuickViewContextValue["open"]>((product, origin, options) => {
    onExited.current = options?.onExited;
    setFlyTo(null);
    setSelected({ product, origin });
  }, []);

  const close = useCallback(() => {
    setFlyTo(null);
    setSelected(null);
  }, []);

  const addToCart = (product: Product, variant: AnyVariant) => {
    const r = cartButtonRef.current?.getBoundingClientRect();
    add(product, variant);
    setFlyTo(r ? { left: r.left + r.width / 2 - 9, top: r.top + r.height / 2 - 12, width: 18, height: 24 } : null);
    setSelected(null);
    // the panel slides in while the photo is still on its way
    window.setTimeout(openCart, 380);
  };

  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuickViewContext.Provider value={value}>
      {children}
      <AnimatePresence
        custom={flyTo}
        onExitComplete={() => {
          onExited.current?.();
          onExited.current = undefined;
        }}
      >
        {selected && (
          <ProductDetail
            key={selected.product.id}
            product={selected.product}
            origin={selected.origin}
            onClose={close}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used inside <QuickViewProvider>");
  return ctx;
}
