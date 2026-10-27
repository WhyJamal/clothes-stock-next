"use client";

import { useState } from "react";
import { SceneRail, type SelectInfo } from "@/components/scene-rail/scene-rail";
import { useQuickView } from "@/components/quick-view/quick-view-provider";
import type { TopProduct } from "@/types";

type Props = {
  products: TopProduct[];
  className?: string;
  /** Slow automatic drift in px per second (the home page uses it). */
  drift?: number;
  showBar?: boolean;
};

/** The clothes rail. Clicking a garment opens the product card (see QuickViewProvider). */
export function Storefront({ products, className, drift, showBar }: Props) {
  const quickView = useQuickView();
  // The garment that is open in the card disappears from the rail until the card is closed.
  const [hiddenIndex, setHiddenIndex] = useState<number | null>(null);

  const open = (product: TopProduct, { itemIndex, rect }: SelectInfo) => {
    setHiddenIndex(itemIndex);
    quickView.open(
      product,
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      { onExited: () => setHiddenIndex(null) },
    );
  };

  return (
    <SceneRail
      className={className}
      products={products}
      onSelect={open}
      hiddenIndex={hiddenIndex}
      drift={drift}
      showBar={showBar}
    />
  );
}
