"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { SceneRail, type SelectInfo } from "@/components/scene-rail/scene-rail";
import { ProductDetail, type Box } from "@/components/product-detail";
import { useCart } from "@/components/cart/cart-provider";
import type { Product, Size } from "@/lib/products";

type Selected = { product: Product; position: number; origin: Box };

export function Storefront({ products, className }: { products: Product[]; className?: string }) {
  const { add, openCart, cartButtonRef } = useCart();
  const [selected, setSelected] = useState<Selected | null>(null);
  const [hiddenIndex, setHiddenIndex] = useState<number | null>(null);
  // Where the photo flies when the detail closes: the cart icon, or null = back to the rail.
  const [flyTo, setFlyTo] = useState<Box | null>(null);

  const open = (product: Product, { itemIndex, rect }: SelectInfo) => {
    setFlyTo(null);
    setHiddenIndex(itemIndex);
    setSelected({
      product,
      position: products.findIndex((p) => p.id === product.id),
      origin: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
  };

  const close = () => {
    setFlyTo(null);
    setSelected(null);
  };

  const addToCart = (product: Product, size: Size) => {
    const r = cartButtonRef.current?.getBoundingClientRect();
    add(product, size);
    setFlyTo(
      r ? { left: r.left + r.width / 2 - 9, top: r.top + r.height / 2 - 12, width: 18, height: 24 } : null,
    );
    setSelected(null);
    // the panel slides in while the photo is still on its way
    window.setTimeout(openCart, 380);
  };

  return (
    <>
      <SceneRail className={className} products={products} onSelect={open} hiddenIndex={hiddenIndex} />

      <AnimatePresence custom={flyTo} onExitComplete={() => setHiddenIndex(null)}>
        {selected && (
          <ProductDetail
            key={selected.product.id}
            product={selected.product}
            position={selected.position}
            total={products.length}
            origin={selected.origin}
            onClose={close}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </>
  );
}
